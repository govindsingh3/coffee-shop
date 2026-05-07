import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, X, Loader2, CheckCircle2, Download, Printer } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { downloadReceipt, printReceipt } from '../utils/receiptGenerator';

interface CartItem {
  drinkType: string;
  quantity: number;
  price?: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  totalAmount: number;
  cartItems: CartItem[];
  customerType: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess, totalAmount, cartItems, customerType }) => {
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [transactionId, setTransactionId] = useState('');
  const [orderId, setOrderId] = useState('');

  const tax = totalAmount * 0.05;
  const grandTotal = totalAmount + tax;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setLoading(true);

    try {
      const paymentRes = await api.post('/payments/process', { amount: grandTotal });
      setTransactionId(paymentRes.data.transactionId || 'txn_mock');
      
      // Place the order after payment
      const orderRes = await api.post('/orders', {
        items: cartItems.map(i => ({ drinkType: i.drinkType, quantity: i.quantity })),
        customerType,
        customerPhone: phone
      });
      setOrderId(orderRes.data.id || 'unknown');

      setStep('success');
      toast.success('Payment successful! Your order is being prepared.', { icon: '🎉' });
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      setStep('details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    downloadReceipt({
      orderId,
      items: cartItems.map(i => ({ name: i.drinkType, quantity: i.quantity, price: i.price || 0 })),
      customerType,
      date: new Date().toLocaleString('en-IN'),
      total: totalAmount,
      tax,
      grandTotal,
      paymentMethod: 'Card',
      transactionId
    });
  };

  const handlePrintReceipt = () => {
    printReceipt({
      orderId,
      items: cartItems.map(i => ({ name: i.drinkType, quantity: i.quantity, price: i.price || 0 })),
      customerType,
      date: new Date().toLocaleString('en-IN'),
      total: totalAmount,
      tax,
      grandTotal,
      paymentMethod: 'Card',
      transactionId
    });
  };

  const handleDone = () => {
    onSuccess();
    onClose();
    setStep('details');
    setPhone('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setTransactionId('');
    setOrderId('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={step === 'details' ? onClose : undefined}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md overflow-hidden"
          >
            {step === 'details' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                    <CreditCard className="text-amber-500" /> Secure Checkout
                  </h2>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-2xl mb-4 border border-amber-100">
                  <div className="space-y-1 text-sm mb-3">
                    {cartItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-gray-600">
                        <span>{item.drinkType} x{item.quantity}</span>
                        <span>₹{((item.price || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-amber-200 pt-2 space-y-1 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span><span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>GST (5%)</span><span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-amber-700 pt-1">
                      <span>Total</span><span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-600 ml-1 flex items-center gap-1">
                      <Smartphone size={16} /> WhatsApp Number (for updates)
                    </label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-600 ml-1">Card Information</label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <input 
                        type="text" 
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        required
                        placeholder="Card Number"
                        className="w-full px-4 py-3 border-b border-gray-200 bg-transparent focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                      />
                      <div className="flex">
                        <input 
                          type="text" 
                          value={expiry}
                          onChange={e => setExpiry(e.target.value)}
                          required
                          placeholder="MM / YY"
                          className="w-1/2 px-4 py-3 border-r border-gray-200 bg-transparent focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                        />
                        <input 
                          type="text" 
                          value={cvv}
                          onChange={e => setCvv(e.target.value)}
                          required
                          placeholder="CVC"
                          className="w-1/2 px-4 py-3 bg-transparent focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 mt-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Processing...' : `Pay ₹${grandTotal.toFixed(2)}`}
                  </motion.button>
                </form>
              </>
            )}

            {step === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-gray-800">Processing Payment...</h3>
                <p className="text-gray-500 mt-2">Please do not close this window.</p>
              </div>
            )}

            {step === 'success' && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-8 flex flex-col items-center justify-center text-center"
              >
                <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
                <h3 className="text-2xl font-black text-gray-800">Payment Successful!</h3>
                <p className="text-gray-500 mt-1 mb-1">Order #{orderId.substring(0, 8).toUpperCase()}</p>
                <p className="text-amber-600 font-bold text-lg mb-6">₹{grandTotal.toFixed(2)}</p>

                <div className="flex gap-3 w-full">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDownloadReceipt}
                    className="flex-1 py-3 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm border border-amber-200 flex items-center justify-center gap-2 hover:bg-amber-100 transition"
                  >
                    <Download size={18} /> Download Bill
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePrintReceipt}
                    className="flex-1 py-3 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm border border-amber-200 flex items-center justify-center gap-2 hover:bg-amber-100 transition"
                  >
                    <Printer size={18} /> Print Bill
                  </motion.button>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDone}
                  className="w-full py-4 mt-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all"
                >
                  Done ✓
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
