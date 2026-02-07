import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Barista {
  id: string;
  name: string;
  status: string;
  ordersCompleted: number;
  currentWorkload: number;
  workloadRatio: string;
  totalPrepTime: number;
  currentOrder: any | null;
  avgPrepTimePerOrder: number;
}

interface BaristaStats {
  baristas: Barista[];
  totalCompleted: number;
  workloadBalance: string;
  overloadedCount: number;
  underutilizedCount: number;
}

const BaristaDashboard: React.FC = () => {
  const [baristas, setBaristas] = useState<Barista[]>([]);
  const [stats, setStats] = useState<BaristaStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBaristas = async () => {
      try {
        const [statsRes, baristasRes] = await Promise.all([
          api.get('/baristas/stats'),
          api.get('/baristas'),
        ]);
        setStats(statsRes.data);
        setBaristas(baristasRes.data);
      } catch (error) {
        console.error('Failed to fetch baristas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBaristas();
    const interval = setInterval(fetchBaristas, 3000);
    return () => clearInterval(interval);
  }, []);

  const completeOrder = async (baristaId: string, orderId: string) => {
    try {
      console.log('Completing order:', orderId, 'for barista:', baristaId);
      
      const response = await api.post(`/baristas/${baristaId}/orders/${orderId}/complete`);
      console.log('Response:', response.data);

      // Refresh baristas and stats
      const [statsRes, baristasRes] = await Promise.all([
        api.get('/baristas/stats'),
        api.get('/baristas'),
      ]);
      
      setStats(statsRes.data);
      setBaristas(baristasRes.data);
      
      console.log('Baristas refreshed:', baristasRes.data);
      alert('✅ Order completed successfully!');
    } catch (error: any) {
      console.error('Failed to complete order:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('❌ Failed to complete order: ' + (error.response?.data?.message || error.message));
    }
  };

  const autoAssignOrder = async () => {
    try {
      await api.post('/baristas/assign');
      // Refresh baristas
      const [statsRes, baristasRes] = await Promise.all([
        api.get('/baristas/stats'),
        api.get('/baristas'),
      ]);
      setStats(statsRes.data);
      setBaristas(baristasRes.data);
    } catch (error) {
      console.error('Failed to auto-assign order:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin">
          <div className="text-5xl">☕</div>
        </div>
        <p className="text-2xl font-black text-yellow-300 mt-4">Loading baristas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto fade-in-down pb-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-5xl">👨‍🍳</div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Barista Management
          </h1>
        </div>
        <p className="text-yellow-300 font-semibold">Real-time barista workload & order tracking</p>
      </div>

      {/* Overall Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border-2 border-yellow-400 shadow-lg">
            <div className="text-center">
              <p className="text-slate-400 font-semibold text-sm mb-2">Total Orders Completed</p>
              <p className="text-4xl font-black text-yellow-400">{stats.totalCompleted}</p>
              <p className="text-xs text-slate-400 mt-2">📋 All baristas</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border-2 border-cyan-400 shadow-lg">
            <div className="text-center">
              <p className="text-slate-400 font-semibold text-sm mb-2">Workload Balance</p>
              <p className="text-4xl font-black text-cyan-400">{stats.workloadBalance}</p>
              <p className="text-xs text-slate-400 mt-2">⚖️ Target: 98%</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border-2 border-orange-400 shadow-lg">
            <div className="text-center">
              <p className="text-slate-400 font-semibold text-sm mb-2">Overloaded Baristas</p>
              <p className="text-4xl font-black text-orange-400">{stats.overloadedCount}</p>
              <p className="text-xs text-slate-400 mt-2">⚠️ 120%+ average</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border-2 border-green-400 shadow-lg">
            <div className="text-center">
              <p className="text-slate-400 font-semibold text-sm mb-2">Underutilized Baristas</p>
              <p className="text-4xl font-black text-green-400">{stats.underutilizedCount}</p>
              <p className="text-xs text-slate-400 mt-2">✅ up to 80% average</p>
            </div>
          </div>
        </div>
      )}

      {/* Auto-assign Button */}
      <div className="mb-8">
        <button
          onClick={autoAssignOrder}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-black py-4 rounded-xl text-lg transition transform hover:scale-105 shadow-lg"
        >
          🤖 Auto-Assign Next Order to Barista
        </button>
      </div>

      {/* Barista Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {baristas.map((barista) => (
          <div key={barista.id} className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border-3 border-yellow-400 shadow-xl">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-yellow-300">{barista.name}</h2>
                <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                  barista.status === 'BUSY'
                    ? 'bg-red-600 text-white'
                    : 'bg-green-600 text-white'
                }`}>
                  {barista.status}
                </span>
              </div>
              <p className="text-slate-400 text-sm">ID: {barista.id}</p>
            </div>

            {/* Stats */}
            <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-600">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400 text-xs font-semibold">Orders Completed</p>
                  <p className="text-2xl font-black text-yellow-400">{barista.ordersCompleted || 0}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold">Workload Ratio</p>
                  <p className={`text-2xl font-black ${
                    parseFloat(barista.workloadRatio || "0") > 1.2
                      ? 'text-red-400'
                      : parseFloat(barista.workloadRatio || "0") < 0.8
                      ? 'text-green-400'
                      : 'text-blue-400'
                  }`}>
                    {barista.workloadRatio || "0.00"}x
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold">Current Workload</p>
                  <p className="text-xl font-bold text-cyan-400">{barista.currentWorkload || 0}m</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold">Avg Time/Order</p>
                  <p className="text-xl font-bold text-purple-400">{isNaN(barista.avgPrepTimePerOrder) ? 0 : Math.round(barista.avgPrepTimePerOrder)}m</p>
                </div>
              </div>
            </div>

            {/* Current Order */}
            {barista.currentOrder ? (
              <div className="bg-blue-900 border-2 border-blue-500 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-blue-300">📦 Current Order</p>
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">PREPARING</span>
                </div>
                <p className="text-white font-bold mb-2">Order ID: {barista.currentOrder.id}</p>
                {barista.currentOrder.items && (
                  <div className="text-sm text-blue-200 mb-3">
                    <p className="font-semibold mb-1">Items:</p>
                    {barista.currentOrder.items.map((item: any, idx: number) => (
                      <p key={idx} className="ml-2">• {item.drinkType} x{item.quantity}</p>
                    ))}
                  </div>
                )}
                <p className="text-sm text-blue-300 mb-3">⏱️ Prep Time: {barista.currentOrder.prepTime}m</p>
                <button
                  onClick={() => {
                    if (barista.currentOrder && barista.currentOrder.id) {
                      completeOrder(barista.id, barista.currentOrder.id);
                    }
                  }}
                  disabled={!barista.currentOrder}
                  className={`w-full font-bold py-2 rounded-lg transition ${
                    barista.currentOrder
                      ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  ✅ Mark Order Complete
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-4 mb-4 text-center">
                <p className="text-slate-400 font-semibold">✋ Idle - No current order</p>
              </div>
            )}

            {/* Info */}
            <div className="text-xs text-slate-400 text-center pt-2 border-t border-slate-600">
              <p>Total Prep Time: {Math.round(barista.totalPrepTime)}m</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 bg-slate-800 border-2 border-yellow-400 rounded-xl p-6">
        <h3 className="text-yellow-400 font-bold mb-4">📊 Workload Status Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-2"></span>
            <span className="text-slate-300"><strong>Red:</strong> Overloaded (120%+ avg) - should take short orders only</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
            <span className="text-slate-300"><strong>Blue:</strong> Balanced (80%-120% avg) - optimal workload</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2"></span>
            <span className="text-slate-300"><strong>Green:</strong> Underutilized (up to 80% avg) - can take complex orders</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaristaDashboard;
