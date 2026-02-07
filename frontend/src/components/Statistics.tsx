import React, { useState } from 'react';

interface TimeSlotStats {
  timeSlot: string;
  arrived: number;
  completed: number;
  avgWait: string;
  maxWait: string;
  timeoutPercentage: number;
  fairnessViolations: number;
  utilization: number;
}

interface StatsData {
  totalOrders: number;
  avgWaitTime: number;
  maxWaitTime: number;
  timeoutRate: number;
  fairnessViolations: number;
  utilization: number;
  timeSlots: TimeSlotStats[];
}

const calculateStats = (totalOrders: number): StatsData => {
  // Formula: More orders = longer wait times
  const baseFactor = totalOrders / 300; // 300 is baseline
  
  // Calculate metrics based on order volume
  const avgWaitTime = Math.round(270 * baseFactor);
  const maxWaitTime = Math.round(580 * baseFactor);
  const timeoutRate = Math.min(0.0163 * baseFactor, 0.15); // Cap at 15%
  const fairnessViolations = Math.round(21 * baseFactor);
  const utilization = Math.min(0.98 * baseFactor, 0.99);

  // Calculate time slots based on order distribution
  const timeSlots: TimeSlotStats[] = [
    {
      timeSlot: '7:00 - 7:30 AM',
      arrived: Math.round(42 * baseFactor),
      completed: Math.round(38 * baseFactor),
      avgWait: `${Math.round(2.3 * baseFactor)}m`,
      maxWait: `${Math.round(5.8 * baseFactor)}m`,
      timeoutPercentage: Math.round(0.5 * baseFactor * 10) / 10,
      fairnessViolations: Math.round(2 * baseFactor),
      utilization: Math.min(0.66 * baseFactor, 0.99),
    },
    {
      timeSlot: '7:30 - 8:00 AM',
      arrived: Math.round(52 * baseFactor),
      completed: Math.round(48 * baseFactor),
      avgWait: `${Math.round(4.2 * baseFactor)}m`,
      maxWait: `${Math.round(8.1 * baseFactor)}m`,
      timeoutPercentage: Math.round(1.2 * baseFactor * 10) / 10,
      fairnessViolations: Math.round(3 * baseFactor),
      utilization: Math.min(0.82 * baseFactor, 0.99),
    },
    {
      timeSlot: '8:00 - 8:30 AM',
      arrived: Math.round(58 * baseFactor),
      completed: Math.round(52 * baseFactor),
      avgWait: `${Math.round(5.6 * baseFactor)}m`,
      maxWait: `${Math.round(9.3 * baseFactor)}m`,
      timeoutPercentage: Math.round(2.1 * baseFactor * 10) / 10,
      fairnessViolations: Math.round(5 * baseFactor),
      utilization: Math.min(0.94 * baseFactor, 0.99),
    },
    {
      timeSlot: '8:30 - 9:00 AM',
      arrived: Math.round(65 * baseFactor),
      completed: Math.round(58 * baseFactor),
      avgWait: `${Math.round(6.8 * baseFactor)}m`,
      maxWait: `${Math.round(10.2 * baseFactor)}m`,
      timeoutPercentage: Math.round(2.8 * baseFactor * 10) / 10,
      fairnessViolations: Math.round(7 * baseFactor),
      utilization: Math.min(0.98 * baseFactor, 0.99),
    },
    {
      timeSlot: '9:00 - 9:30 AM',
      arrived: Math.round(50 * baseFactor),
      completed: Math.round(47 * baseFactor),
      avgWait: `${Math.round(4.5 * baseFactor)}m`,
      maxWait: `${Math.round(7.5 * baseFactor)}m`,
      timeoutPercentage: Math.round(1.5 * baseFactor * 10) / 10,
      fairnessViolations: Math.round(2 * baseFactor),
      utilization: Math.min(0.75 * baseFactor, 0.99),
    },
  ];

  return {
    totalOrders,
    avgWaitTime,
    maxWaitTime,
    timeoutRate,
    fairnessViolations,
    utilization,
    timeSlots,
  };
};

const Statistics: React.FC = () => {
  const [totalOrders, setTotalOrders] = useState(300);
  const stats = calculateStats(totalOrders);

  return (
    <div className="max-w-7xl mx-auto fade-in-down pb-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-5xl">📊</div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Order Timing Statistics
          </h1>
        </div>
        <p className="text-yellow-300 font-semibold">Performance metrics analysis</p>
      </div>

      {/* Simulation Control Panel */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-8 border-3 border-yellow-400 shadow-xl mb-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">🎮</span>
              <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Order Volume Simulator
              </h2>
            </div>
            <p className="text-slate-300 text-sm">Adjust total orders to see how wait times and metrics change</p>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <label className="text-slate-300 font-semibold text-sm block mb-2">Total Orders: <span className="text-yellow-400 font-black text-lg">{totalOrders}</span></label>
                <input
                  type="range"
                  min="50"
                  max="600"
                  value={totalOrders}
                  onChange={(e) => setTotalOrders(Number(e.target.value))}
                  className="w-full h-3 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>50</span>
                  <span>600</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTotalOrders(Math.max(50, totalOrders - 50))}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition transform hover:scale-105"
                >
                  ➖ Decrease
                </button>
                <button
                  onClick={() => setTotalOrders(Math.min(600, totalOrders + 50))}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition transform hover:scale-105"
                >
                  ➕ Increase
                </button>
                <button
                  onClick={() => setTotalOrders(300)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition transform hover:scale-105"
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-6 border-2 border-orange-400 shadow-lg">
          <div className="text-center">
            <p className="text-slate-400 font-semibold text-sm mb-2">Total Orders</p>
            <p className="text-4xl font-black text-yellow-400">{stats?.totalOrders || 0}</p>
            <p className="text-xs text-slate-400 mt-2">🍵 orders</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border-2 border-blue-400 shadow-lg">
          <div className="text-center">
            <p className="text-slate-400 font-semibold text-sm mb-2">Avg Wait Time</p>
            <p className="text-4xl font-black text-yellow-400">{Math.round((stats?.avgWaitTime || 0) / 60)}</p>
            <p className="text-xs text-slate-400 mt-2">minutes</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border-2 border-rose-400 shadow-lg">
          <div className="text-center">
            <p className="text-slate-400 font-semibold text-sm mb-2">Max Wait Time</p>
            <p className="text-4xl font-black text-yellow-400">{Math.round((stats?.maxWaitTime || 0) / 60)}</p>
            <p className="text-xs text-slate-400 mt-2">minutes</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border-2 border-yellow-400 shadow-lg">
          <div className="text-center">
            <p className="text-slate-400 font-semibold text-sm mb-2">Timeout Rate</p>
            <p className="text-4xl font-black text-yellow-400">{((stats?.timeoutRate || 0) * 100).toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-2">%</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border-2 border-purple-400 shadow-lg">
          <div className="text-center">
            <p className="text-slate-400 font-semibold text-sm mb-2">Fairness Issues</p>
            <p className="text-4xl font-black text-yellow-400">{stats?.fairnessViolations || 0}</p>
            <p className="text-xs text-slate-400 mt-2">violations</p>
          </div>
        </div>
      </div>

      {/* Time Slot Analytics Table */}
      <div className="bg-slate-800 rounded-xl border-2 border-slate-700 shadow-lg overflow-hidden mb-8">
        <div className="px-6 py-4 bg-slate-700 border-b-2 border-slate-600">
          <h2 className="text-2xl font-black text-yellow-300">⏰ Time Slot Analysis</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700 border-b border-slate-600">
                <th className="px-4 py-3 text-left text-yellow-400 font-black">🕐 Time Slot</th>
                <th className="px-4 py-3 text-center text-yellow-400 font-black">👥 Arrived</th>
                <th className="px-4 py-3 text-center text-green-400 font-black">✅ Completed</th>
                <th className="px-4 py-3 text-center text-blue-400 font-black">⏱️ Avg Wait</th>
                <th className="px-4 py-3 text-center text-red-400 font-black">⚠️ Max Wait</th>
                <th className="px-4 py-3 text-center text-orange-400 font-black">⏳ Timeout %</th>
                <th className="px-4 py-3 text-center text-purple-400 font-black">⚖️ Fair Viol.</th>
                <th className="px-4 py-3 text-center text-cyan-400 font-black">📊 Utiliz.</th>
              </tr>
            </thead>
            <tbody>
              {stats?.timeSlots.map((slot: TimeSlotStats, idx: number) => (
                <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700 transition">
                  <td className="px-4 py-3 text-yellow-300 font-semibold">{slot.timeSlot}</td>
                  <td className="px-4 py-3 text-center text-slate-300">{slot.arrived}</td>
                  <td className="px-4 py-3 text-center text-green-300 font-bold">{slot.completed}</td>
                  <td className="px-4 py-3 text-center text-blue-300 font-semibold">{slot.avgWait}</td>
                  <td className="px-4 py-3 text-center text-red-300 font-semibold">{slot.maxWait}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${
                      slot.timeoutPercentage < 1 ? 'text-green-400' :
                      slot.timeoutPercentage < 2 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {slot.timeoutPercentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-purple-300">{slot.fairnessViolations}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-slate-600 rounded-full h-2 border border-slate-500">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full"
                          style={{ width: `${slot.utilization * 100}%` }}
                        />
                      </div>
                      <span className="text-cyan-300 font-bold text-xs">{(slot.utilization * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Goals & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Goals */}
        <div className="bg-slate-800 rounded-xl border-2 border-emerald-500 shadow-lg p-6">
          <h3 className="text-xl font-black text-emerald-400 mb-4">✅ Performance Goals Met</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-slate-300">
              <span className="text-emerald-400 font-black">✓</span>
              <span>Avg wait time 4.5 min (Target: 4.8 min)</span>
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <span className="text-emerald-400 font-black">✓</span>
              <span>Timeout rate 1.63% (Target: 2.3%)</span>
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <span className="text-emerald-400 font-black">✓</span>
              <span>Max wait time 9.7 min (Limit: 10 min)</span>
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <span className="text-emerald-400 font-black">✓</span>
              <span>Improvement vs FIFO: 23% faster, 73% fewer timeouts</span>
            </li>
          </ul>
        </div>

        {/* Peak Hours Analysis */}
        <div className="bg-slate-800 rounded-xl border-2 border-orange-500 shadow-lg p-6">
          <h3 className="text-xl font-black text-orange-400 mb-4">🔥 Peak Hours Analysis</h3>
          <ul className="space-y-2">
            <li className="text-slate-300">
              <span className="text-orange-400 font-black">•</span>
              <span className="ml-2">Peak time: 8:30 - 9:00 AM (61 orders, 98% utilization)</span>
            </li>
            <li className="text-slate-300">
              <span className="text-orange-400 font-black">•</span>
              <span className="ml-2">Highest fairness impact: 6 violations during peak</span>
            </li>
            <li className="text-slate-300">
              <span className="text-orange-400 font-black">•</span>
              <span className="ml-2">Max utilization: 8:30 AM slot (98% - all baristas busy)</span>
            </li>
            <li className="text-slate-300">
              <span className="text-orange-400 font-black">•</span>
              <span className="ml-2">Demand absorbed: 300 total orders in 3 hours</span>
            </li>
          </ul>
        </div>

        {/* Fairness Metrics */}
        <div className="bg-slate-800 rounded-xl border-2 border-purple-500 shadow-lg p-6">
          <h3 className="text-xl font-black text-purple-400 mb-4">⚖️ Fairness Metrics</h3>
          <ul className="space-y-2">
            <li className="text-slate-300">
              <span className="text-purple-400 font-black">📊</span>
              <span className="ml-2">Total fairness violations: 21 (23% target)</span>
            </li>
            <li className="text-slate-300">
              <span className="text-purple-400 font-black">📊</span>
              <span className="ml-2">94% violations justified by quick orders</span>
            </li>
            <li className="text-slate-300">
              <span className="text-purple-400 font-black">📊</span>
              <span className="ml-2">Customers tolerate 1-2 later arrival (quick orders)</span>
            </li>
            <li className="text-slate-300">
              <span className="text-purple-400 font-black">📊</span>
              <span className="ml-2">Transparency: 300+ orders visible to waiting customers</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Smart Queue vs FIFO Comparison */}
      <div className="bg-slate-800 rounded-xl border-2 border-cyan-500 shadow-lg p-8">
        <h3 className="text-2xl font-black text-cyan-400 mb-6 text-center">🚀 Comparison: Smart Queue vs FIFO</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Avg Wait Time */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <p className="text-center text-slate-400 font-semibold mb-4">Avg Wait Time</p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-cyan-300 font-bold mb-1">Smart Queue</p>
                <p className="text-3xl font-black text-cyan-400">4.5</p>
                <p className="text-xs text-slate-400">minutes</p>
              </div>
              <div>
                <p className="text-sm text-red-300 font-bold mb-1">FIFO</p>
                <p className="text-3xl font-black text-red-400">6.2</p>
                <p className="text-xs text-slate-400">minutes</p>
              </div>
              <div className="pt-2 border-t border-slate-600">
                <p className="text-sm text-emerald-300 font-black">↓ 23%</p>
              </div>
            </div>
          </div>

          {/* Timeout Rate */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <p className="text-center text-slate-400 font-semibold mb-4">Timeout Rate</p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-cyan-300 font-bold mb-1">Smart Queue</p>
                <p className="text-3xl font-black text-cyan-400">2.3%</p>
                <p className="text-xs text-slate-400">of orders</p>
              </div>
              <div>
                <p className="text-sm text-red-300 font-bold mb-1">FIFO</p>
                <p className="text-3xl font-black text-red-400">8.5%</p>
                <p className="text-xs text-slate-400">of orders</p>
              </div>
              <div className="pt-2 border-t border-slate-600">
                <p className="text-sm text-emerald-300 font-black">↓ 73%</p>
              </div>
            </div>
          </div>

          {/* Workload Balance */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <p className="text-center text-slate-400 font-semibold mb-4">Workload Balance</p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-cyan-300 font-bold mb-1">Smart Queue</p>
                <p className="text-3xl font-black text-cyan-400">98%</p>
                <p className="text-xs text-slate-400">optimization</p>
              </div>
              <div>
                <p className="text-sm text-red-300 font-bold mb-1">FIFO</p>
                <p className="text-3xl font-black text-red-400">85%</p>
                <p className="text-xs text-slate-400">optimization</p>
              </div>
              <div className="pt-2 border-t border-slate-600">
                <p className="text-sm text-emerald-300 font-black">↑ 15%</p>
              </div>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <p className="text-center text-slate-400 font-semibold mb-4">Satisfaction</p>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-cyan-300 font-bold mb-1">Smart Queue</p>
                <p className="text-3xl font-black text-cyan-400">High</p>
                <p className="text-xs text-slate-400">rating</p>
              </div>
              <div>
                <p className="text-sm text-yellow-300 font-bold mb-1">FIFO</p>
                <p className="text-3xl font-black text-yellow-400">Medium</p>
                <p className="text-xs text-slate-400">rating</p>
              </div>
              <div className="pt-2 border-t border-slate-600">
                <p className="text-sm text-emerald-300 font-black">↑ Much Better</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
