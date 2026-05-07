import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Users, AlertTriangle, Coffee, Timer, Star, User, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { printReceipt } from '../utils/receiptGenerator';

interface Order {
  id: string | null;
  items: { drinkType: string; quantity: number }[];
  priorityScore: number;
  arrivalTime: string;
  totalPrepTime?: number;
  customerType?: string;
  regular: boolean;
}

const QueueDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<{ [key: string]: number }>({});
  const [calculatedStats, setCalculatedStats] = useState({
    totalOrders: 0,
    avgWaitTime: 0,
    timeoutRate: 0
  });

  useEffect(() => {
    const now = new Date().getTime();
    let totalWaitTime = 0;
    let timeoutCount = 0;
    const MAX_WAIT_TIME = 600;

    orders.forEach((order) => {
      if (order.arrivalTime) {
        const arrivalTime = new Date(order.arrivalTime).getTime();
        const waitTime = (now - arrivalTime) / 1000;
        totalWaitTime += waitTime;

        if (waitTime > MAX_WAIT_TIME) {
          timeoutCount += 1;
        }
      }
    });

    const avgWait = orders.length > 0 ? totalWaitTime / orders.length : 0;
    const timeoutRate = orders.length > 0 ? (timeoutCount / orders.length) * 100 : 0;

    setCalculatedStats({
      totalOrders: orders.length,
      avgWaitTime: avgWait,
      timeoutRate: timeoutRate
    });
  }, [orders]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const newCountdown: { [key: string]: number } = {};

      orders.forEach((order) => {
        if (order.arrivalTime && order.totalPrepTime) {
          const arrivalTime = new Date(order.arrivalTime).getTime();
          const readyTime = arrivalTime + (order.totalPrepTime * 1000);
          const remaining = Math.max(0, Math.floor((readyTime - now) / 1000));
          newCountdown[order.id || ''] = remaining;
        }
      });

      setCountdown(newCountdown);
    }, 1000);

    return () => clearInterval(timer);
  }, [orders]);

  const fetchQueue = async () => {
    try {
      const response = await api.get('/queue');
      setOrders(response.data.waitingOrders || []);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const completeOrder = async (orderId: string) => {
    try {
      await api.post(`/orders/${orderId}/complete`);
      toast.success('Order completed!', {
        icon: '🎉',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      fetchQueue();
    } catch (error) {
      toast.error('Failed to complete order');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-amber-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Coffee size={48} />
        </motion.div>
        <span className="ml-4 text-2xl font-bold">Loading Queue...</span>
      </div>
    );
  }

  const formatTime = (seconds: number): string => {
    if (seconds === 0) return 'Ready!';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-12"
    >
      <div className="mb-10 text-center">
        <h2 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-orange-600">
          Queue Dashboard
        </h2>
        <p className="text-amber-700 text-lg font-medium">Real-time order management & priority routing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-amber-200 shadow-xl shadow-amber-900/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-600"><Users size={24} /></div>
            <div>
              <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">Total Orders</p>
              <p className="text-4xl font-bold text-gray-800">{calculatedStats.totalOrders}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-green-200 shadow-xl shadow-green-900/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl text-green-600"><Clock size={24} /></div>
            <div>
              <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">Avg Wait</p>
              <p className="text-4xl font-bold text-gray-800">
                {calculatedStats.avgWaitTime > 0 ? `${Math.round(calculatedStats.avgWaitTime)}s` : '—'}
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-red-200 shadow-xl shadow-red-900/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl text-red-600"><AlertTriangle size={24} /></div>
            <div>
              <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">Timeout Rate</p>
              <p className="text-4xl font-bold text-gray-800">{calculatedStats.timeoutRate.toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Timer className="text-amber-600" /> Live Queue 
          </h3>
          <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-inner">
            {orders.length} Active
          </span>
        </div>
        
        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm border-2 border-dashed border-amber-200 rounded-3xl"
          >
            <Coffee size={64} className="text-amber-300 mb-4" />
            <p className="text-amber-700 text-xl font-semibold">Queue is clear! Ready for the rush.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {orders.map((order, idx) => {
              const isReady = countdown[order.id || ''] === 0;
              const isVIP = order.customerType === 'VIP Premium';
              
              return (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={order.id}
                className={`relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border-l-8 hover:shadow-xl transition-all ${
                  isVIP ? 'border-l-purple-500' : 'border-l-amber-400'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/0 to-amber-100/50 rounded-bl-full pointer-events-none" />
                
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                  
                  {/* Position & ID */}
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-2xl text-white shadow-md flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Order ID</p>
                      <p className="text-lg font-mono font-bold text-gray-800">#{order.id ? order.id.substring(0, 8) : 'NEW'}...</p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                    {/* Items */}
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                            <span className="font-semibold text-gray-800">{item.drinkType}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer */}
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Customer</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm ${
                        isVIP 
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {isVIP ? <Star size={16} className="fill-current" /> : <User size={16} />}
                        {isVIP ? 'VIP Premium' : 'Regular'}
                      </span>
                    </div>

                    {/* Priority Score */}
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Priority</p>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-black text-gray-800">{order.priorityScore.toFixed(1)}</div>
                        <div className="flex-1 max-w-[60px] h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              order.priorityScore > 20 ? 'bg-red-500' : order.priorityScore > 10 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(order.priorityScore, 40) * 2.5}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status / Timer */}
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Status</p>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg shadow-sm border ${
                        isReady
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <Timer size={18} />
                        {formatTime(countdown[order.id || ''] || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full md:w-auto mt-4 md:mt-0 flex justify-end gap-2">
                    <button
                      onClick={() => printReceipt({
                        orderId: order.id || 'unknown',
                        items: order.items.map(i => ({ name: i.drinkType, quantity: i.quantity, price: 150 })),
                        customerType: order.customerType || 'Regular',
                        date: new Date(order.arrivalTime).toLocaleString('en-IN'),
                        total: order.items.reduce((s, i) => s + i.quantity * 150, 0),
                        tax: order.items.reduce((s, i) => s + i.quantity * 150, 0) * 0.05,
                        grandTotal: order.items.reduce((s, i) => s + i.quantity * 150, 0) * 1.05,
                        paymentMethod: 'Card',
                        transactionId: 'N/A'
                      })}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-amber-700 bg-amber-50 border border-amber-200 transition-all hover:bg-amber-100 active:scale-95"
                    >
                      <Printer size={18} />
                      Bill
                    </button>
                    <button
                      onClick={() => completeOrder(order.id || '')}
                      disabled={!isReady && false}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 ${
                        isReady 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/25'
                          : 'bg-gray-800 hover:bg-gray-900'
                      }`}
                    >
                      <CheckCircle size={20} />
                      Complete
                    </button>
                  </div>
                </div>
              </motion.div>
            )})}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default QueueDashboard;
