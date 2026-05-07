import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart, Star, Coffee, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import CheckoutModal from './CheckoutModal';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

const Menu: React.FC = () => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [customerType, setCustomerType] = useState<'Regular' | 'VIP Premium'>('Regular');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const defaultMenu: MenuItem[] = [
    { id: '1', name: 'Espresso', price: 150, description: 'Classic strong coffee shot', image: '☕' },
    { id: '2', name: 'Latte', price: 200, description: 'Smooth milk and espresso', image: '🥛' },
    { id: '3', name: 'Cappuccino', price: 180, description: 'Rich and creamy froth', image: '🧁' },
    { id: '4', name: 'Americano', price: 140, description: 'Bold and smooth taste', image: '🥤' },
    { id: '5', name: 'Cold Brew', price: 120, description: 'Refreshing chilled coffee', image: '🧊' },
    { id: '6', name: 'Mocha', price: 250, description: 'Chocolate and espresso blend', image: '🍫' }
  ];

  const handleQuantityChange = (id: string, delta: number) => {
    setCart(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const clearCart = () => setCart({});

  const handleCheckoutClick = () => {
    if (totalItems === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = async () => {
    // Order is already placed inside CheckoutModal after payment
    setCart({});
    setCustomerType('Regular');
    setIsCheckoutOpen(false);
  };

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = defaultMenu.find(m => m.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 pb-20"
    >
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-amber-900 mb-4 inline-flex items-center gap-3">
          <Sparkles className="text-amber-500" size={40} /> Premium Menu
        </h2>
        <p className="text-amber-700/80 text-lg font-medium">Crafted with passion, served with excellence</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Menu Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {defaultMenu.map((item, idx) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-amber-900/5 border border-amber-100 flex flex-col relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full transition-all group-hover:scale-110" />
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="text-4xl bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
                  {item.image}
                </div>
                <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  ₹{item.price}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-1">{item.name}</h3>
              <p className="text-gray-500 text-sm mb-6 flex-1">{item.description}</p>
              
              <div className="flex items-center justify-between mt-auto bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuantityChange(item.id, -1)}
                  className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center text-amber-700 hover:bg-amber-500 hover:text-white transition-colors"
                >
                  <Minus size={20} />
                </motion.button>
                <span className="text-xl font-bold text-gray-800 w-12 text-center">
                  {cart[item.id] || 0}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuantityChange(item.id, 1)}
                  className="w-10 h-10 rounded-lg bg-amber-500 shadow flex items-center justify-center text-white hover:bg-amber-600 transition-colors"
                >
                  <Plus size={20} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary Sticky Panel */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-amber-900/10 border border-amber-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <ShoppingCart className="text-amber-500" /> Your Order
              </h3>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                {totalItems} items
              </span>
            </div>
            
            <div className="mb-6 min-h-[100px] max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {totalItems === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="h-full flex flex-col items-center justify-center text-gray-400 py-8"
                  >
                    <Coffee size={48} className="mb-3 opacity-20" />
                    <p>Your cart is empty</p>
                  </motion.div>
                ) : (
                  Object.entries(cart)
                    .filter(([_, qty]) => qty > 0)
                    .map(([id, qty]) => {
                      const item = defaultMenu.find(m => m.id === id);
                      return (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          key={id} 
                          className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">{qty}</span>
                            <span className="font-semibold text-gray-700">{item?.name}</span>
                          </div>
                          <span className="font-bold text-gray-800">₹{((item?.price || 0) * qty).toFixed(2)}</span>
                        </motion.div>
                      );
                    })
                )}
              </AnimatePresence>
            </div>

            {totalItems > 0 && (
              <div className="text-right mb-6">
                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear All</button>
              </div>
            )}

            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium uppercase tracking-wider text-sm">Total Amount</span>
                <span className="text-4xl font-black text-amber-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Customer Tier</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCustomerType('Regular')}
                  className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    customerType === 'Regular'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Regular
                </button>
                <button
                  onClick={() => setCustomerType('VIP Premium')}
                  className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    customerType === 'VIP Premium'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Star size={16} className={customerType === 'VIP Premium' ? 'fill-current text-yellow-300' : ''} />
                  VIP
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckoutClick}
              disabled={totalItems === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                totalItems > 0
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <>Place Order <ShoppingCart size={20} /></>
            </motion.button>
          </div>
        </div>
      </div>
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handlePlaceOrder}
        totalAmount={total}
        cartItems={Object.entries(cart)
          .filter(([_, qty]) => qty > 0)
          .map(([id, qty]) => ({
            drinkType: defaultMenu.find(m => m.id === id)?.name || 'Unknown',
            quantity: qty,
            price: defaultMenu.find(m => m.id === id)?.price || 0
          }))}
        customerType={customerType}
      />
    </motion.div>
  );
};

export default Menu;
