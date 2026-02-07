import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface OrderItem {
  drinkType: string;
  quantity: number;
}

interface Order {
  id: string | null;
  items: OrderItem[];
  priorityScore: number;
  arrivalTime: string;
  regular: boolean;
  status?: string;
  assignedBarista?: string;
}

interface Barista {
  id: string;
  name: string;
  status: string;
}

interface QueueStats {
  totalOrders: number;
  avgWaitTime: number;
  timeoutRate: number;
}

const QueueDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [baristas, setBaristas] = useState<Barista[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState<{ [key: string]: number }>({});
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedBarista, setSelectedBarista] = useState<string | null>(null);

  const TIMEOUT_SECONDS = 600; // 10 minutes

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const [queueRes, baristasRes] = await Promise.all([
          api.get('/queue'),
          api.get('/baristas'),
        ]);
        setOrders(queueRes.data.waitingOrders || []);
        setStats(queueRes.data.stats || {});
        setBaristas(baristasRes.data || []);

        // Initialize timers for new orders
        const newTimers: { [key: string]: number } = {};
        (queueRes.data.waitingOrders || []).forEach((order: Order) => {
          if (order.id && !timers[order.id]) {
            newTimers[order.id] = TIMEOUT_SECONDS;
          }
        });
        if (Object.keys(newTimers).length > 0) {
          setTimers((prev) => ({ ...prev, ...newTimers }));
        }
      } catch (error) {
        console.error('Failed to fetch queue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((orderId) => {
          if (updated[orderId] > 0) {
            updated[orderId] -= 1;
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (seconds: number) => {
    const percentage = (seconds / TIMEOUT_SECONDS) * 100;
    if (percentage > 50) return 'text-green-400';
    if (percentage > 25) return 'text-yellow-400';
    return 'text-red-600';
  };

  const assignBarista = async (orderId: string, baristaId: string) => {
    try {
      await api.post(`/baristas/${baristaId}/assign/${orderId}`);
      setSelectedOrder(null);
      setSelectedBarista(null);
      // Refresh queue
      const queueRes = await api.get('/queue');
      setOrders(queueRes.data.waitingOrders || []);
      alert('✅ Order assigned to barista successfully!');
    } catch (error) {
      console.error('Failed to assign order:', error);
      alert('❌ Failed to assign order');
    }
  };

  const completeOrder = async (orderId: string, baristaId?: string) => {
    try {
      console.log('Completing order:', orderId, 'Barista:', baristaId);
      
      if (baristaId) {
        const response = await api.post(`/baristas/${baristaId}/orders/${orderId}/complete`);
        console.log('Complete response:', response.data);
      } else {
        const response = await api.post(`/orders/${orderId}/complete`);
        console.log('Complete response:', response.data);
      }
      
      // Refresh queue and baristas
      const queueRes = await api.get('/queue');
      
      setOrders(queueRes.data.waitingOrders || []);
      setTimers((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
      
      console.log('Orders refreshed:', queueRes.data.waitingOrders);
      alert('✅ Order marked as complete!');
    } catch (error: any) {
      console.error('Failed to complete order:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('❌ Failed to mark order complete: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin">
          <div className="text-5xl">☕</div>
        </div>
        <p className="text-2xl font-black text-yellow-300 mt-4">Brewing your queue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto fade-in-down">
      <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent text-center drop-shadow-lg">📊 Queue Status</h2>
      <p className="text-center text-yellow-300 mb-8 text-lg font-semibold">Live order tracking</p>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800 rounded-2xl p-6 border-3 border-orange-400 shadow-lg hover:shadow-xl transition scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 font-bold text-sm">📦 Total Orders</p>
                <p className="text-5xl font-black text-yellow-400">{stats.totalOrders}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6 border-3 border-green-400 shadow-lg hover:shadow-xl transition scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 font-bold text-sm">⏱️ Avg Wait Time</p>
                <p className="text-5xl font-black text-yellow-400">{Math.round(stats.avgWaitTime)}<span className="text-2xl">s</span></p>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6 border-3 border-red-400 shadow-lg hover:shadow-xl transition scale-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 font-bold text-sm">🚨 Timeout Rate</p>
                <p className="text-5xl font-black text-yellow-400">{(stats.timeoutRate * 100).toFixed(1)}<span className="text-2xl">%</span></p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-3xl font-black text-yellow-300">⏳ Waiting Orders</h3>
        
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl border-2 border-dashed border-yellow-300">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xl font-black text-yellow-300">No orders in queue - Queue is empty!</p>
            <p className="text-slate-300 mt-2">Place an order to get started</p>
          </div>
        ) : (
          orders.map((order, idx) => {
            const timeRemaining = timers[order.id || ''] || TIMEOUT_SECONDS;
            const isTimedOut = timeRemaining <= 0;
            
            return (
              <div
                key={order.id}
                className={`bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 p-6 border-3 ${
                  isTimedOut ? 'border-red-600' : order.regular ? 'border-blue-400' : 'border-yellow-400'
                } scale-in`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`text-4xl ${isTimedOut ? '🚨' : order.regular ? '😊' : '👑'}`}></div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order #{idx + 1}</p>
                      <p className="text-lg font-black text-yellow-300">{order.id ? order.id.substring(0, 8) : 'NEW'}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-bold text-sm ${order.regular ? 'bg-blue-600 text-blue-200' : 'bg-yellow-600 text-yellow-100'}`}>
                    {order.regular ? '👤 Regular' : '⭐ VIP'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">items</p>
                    <div className="space-y-1">
                      {order.items.map((item: OrderItem, itemIdx: number) => (
                        <div key={itemIdx} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">🍵 {item.drinkType}</span>
                          <span className="bg-yellow-600 text-yellow-100 px-2 py-1 rounded-full text-xs font-black">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">priority score</p>
                    <div className="w-full bg-slate-600 rounded-full h-4 overflow-hidden border-2 border-slate-500">
                      <div
                        className={`h-full rounded-full transition-all ${
                          order.priorityScore > 20
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : order.priorityScore > 10
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                        style={{ width: `${Math.min(order.priorityScore, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm font-black text-yellow-300 mt-2">{order.priorityScore.toFixed(1)}</p>
                  </div>

                  <div className={`rounded-lg p-4 border ${
                    isTimedOut ? 'bg-red-900 border-red-500' : 'bg-slate-700 border-slate-600'
                  }`}>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">⏱️ time left</p>
                    <p className={`text-3xl font-black font-mono ${getTimerColor(timeRemaining)}`}>
                      {formatTime(timeRemaining)}
                    </p>
                    {isTimedOut && <p className="text-xs text-red-300 mt-1 font-bold">⚠️ TIMEOUT!</p>}
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">status</p>
                      {order.status === 'COMPLETED' || order.status === 'READY' ? (
                        <div>
                          <p className="text-3xl mb-1">✅</p>
                          <p className="font-black text-green-400">DONE</p>
                        </div>
                      ) : order.assignedBarista ? (
                        <div>
                          <p className="text-3xl mb-1">👨‍🍳</p>
                          <p className="font-black text-cyan-400 text-xs">Making...</p>
                        </div>
                      ) : (
                        <div className="animate-pulse">
                          <p className="text-3xl mb-1">⏳</p>
                          <p className="font-black text-yellow-300">Waiting...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Barista Assignment Section */}
                <div className="flex gap-2 pt-4 border-t border-slate-600">
                  {!order.assignedBarista ? (
                    <>
                      <button
                        onClick={() => setSelectedOrder(order.id || null)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-2 rounded-lg transition transform hover:scale-105"
                      >
                        👨‍🍳 Assign Barista
                      </button>
                      {selectedOrder === order.id && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                          <div className="bg-slate-800 rounded-2xl p-8 border-3 border-yellow-400 shadow-2xl max-w-md w-full mx-4">
                            <h3 className="text-2xl font-black text-yellow-300 mb-4">👨‍🍳 Select Barista</h3>
                            <p className="text-slate-300 mb-4">Order: {order.id?.substring(0, 8)}</p>
                            
                            <div className="space-y-2 mb-6">
                              {baristas.map((barista) => (
                                <button
                                  key={barista.id}
                                  onClick={() => setSelectedBarista(barista.id)}
                                  className={`w-full p-3 rounded-lg font-bold transition ${
                                    selectedBarista === barista.id
                                      ? 'bg-yellow-500 text-slate-900 border-2 border-yellow-600'
                                      : 'bg-slate-700 text-white border-2 border-slate-600 hover:border-yellow-400'
                                  }`}
                                >
                                  {barista.name} - {barista.status}
                                </button>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (selectedBarista) {
                                    assignBarista(order.id || '', selectedBarista);
                                  }
                                }}
                                disabled={!selectedBarista}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                              >
                                ✅ Assign
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedOrder(null);
                                  setSelectedBarista(null);
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => completeOrder(order.id || '', order.assignedBarista)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 rounded-lg transition transform hover:scale-105"
                    >
                      ✅ Mark Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QueueDashboard;
