import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, DollarSign, ShoppingBag, TrendingUp, 
  Users, Coffee, Package, ArrowUpRight, ArrowDownRight,
  Search, Filter, ChevronDown, Printer, QrCode
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { printReceipt } from '../utils/receiptGenerator';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

interface DashboardData {
  todayOrders: number;
  todayCompleted: number;
  todayWaiting: number;
  todayRevenue: number;
  avgOrderValue: number;
  totalOrders: number;
  hourlyRevenue: { [key: string]: number };
  popularItems: { name: string; count: number }[];
}

interface Order {
  id: string;
  items: { drinkType: string; quantity: number }[];
  status: string;
  customerType: string;
  customerPhone: string;
  arrivalTime: string;
  completionTime: string;
  priorityScore: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'qr'>('overview');
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [qrCodes, setQrCodes] = useState<{ [key: number]: string }>({});
  const [tableCount, setTableCount] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    fetchOrders();
  }, [statusFilter]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setDashData(res.data);
    } catch (e) {
      console.error('Failed to fetch dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const url = statusFilter ? `/admin/orders?status=${statusFilter}` : '/admin/orders';
      const res = await api.get(url);
      setOrders(res.data);
    } catch (e) {
      console.error('Failed to fetch orders', e);
    }
  };

  const generateQRCodes = async () => {
    const codes: { [key: number]: string } = {};
    // Use network-accessible URL instead of localhost
    const baseUrl = window.location.origin;
    const networkUrl = baseUrl.includes('localhost') 
      ? baseUrl.replace('localhost', getNetworkIP()) 
      : baseUrl;
    
    for (let i = 1; i <= tableCount; i++) {
      const url = `${networkUrl}/?table=${i}`;
      codes[i] = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: { dark: '#78350f', light: '#fffbeb' }
      });
    }
    setQrCodes(codes);
    toast.success(`Generated QR codes for ${tableCount} tables!`);
  };

  // Helper to get network IP — falls back to displaying a prompt
  const getNetworkIP = (): string => {
    const stored = sessionStorage.getItem('networkIP');
    if (stored) return stored;
    const ip = prompt('Enter your computer\'s local IP address (e.g., 192.168.1.5).\nYour phone must be on the same WiFi to scan QR codes.\n\nFind it via: Settings > WiFi > IP Address, or run "ipconfig" in terminal.', '192.168.1.1');
    if (ip) {
      sessionStorage.setItem('networkIP', ip);
      return ip;
    }
    return 'localhost';
  };

  const printAllQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html><head><title>Table QR Codes - Bean & Brew</title>
      <style>
        body { font-family: Arial; text-align: center; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; padding: 24px; }
        .card { border: 2px solid #d97706; border-radius: 16px; padding: 20px; page-break-inside: avoid; }
        .card h2 { color: #78350f; margin: 8px 0 4px; font-size: 22px; }
        .card p { color: #92400e; font-size: 13px; margin: 0; }
        .card img { width: 180px; height: 180px; }
        @media print { .grid { grid-template-columns: repeat(2, 1fr); } }
      </style></head><body>
      <h1 style="color:#78350f;">☕ Bean & Brew - Table QR Codes</h1>
      <div class="grid">${Object.entries(qrCodes).map(([t, src]) => `
        <div class="card">
          <img src="${src}" />
          <h2>Table ${t}</h2>
          <p>Scan to order from your table</p>
        </div>`).join('')}
      </div></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Access Required</h2>
        <p className="text-gray-500">Please login as staff to access the admin panel.</p>
      </div>
    );
  }

  const chartData = dashData ? Object.entries(dashData.hourlyRevenue).map(([hour, rev]) => ({
    hour: `${hour}:00`,
    revenue: rev
  })) : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-600 mb-2">
          Admin Dashboard
        </h2>
        <p className="text-amber-700/70 font-medium">Welcome back, {user.username}. Here's your business overview.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 bg-amber-50/50 p-1.5 rounded-2xl border border-amber-100 w-fit">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'orders', label: 'Order History', icon: Package },
          { key: 'qr', label: 'QR Tables', icon: QrCode }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm ${
              activeTab === tab.key
                ? 'bg-white text-amber-700 shadow-md shadow-amber-900/5'
                : 'text-amber-700/60 hover:text-amber-700 hover:bg-white/50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* === OVERVIEW TAB === */}
      {activeTab === 'overview' && dashData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Today's Revenue", value: `₹${dashData.todayRevenue.toLocaleString()}`, icon: DollarSign, color: 'amber', trend: '+12%', up: true },
              { label: "Today's Orders", value: dashData.todayOrders.toString(), icon: ShoppingBag, color: 'blue', trend: `${dashData.todayWaiting} waiting`, up: true },
              { label: 'Avg Order Value', value: `₹${dashData.avgOrderValue}`, icon: TrendingUp, color: 'green', trend: '+5%', up: true },
              { label: 'Total All-Time', value: dashData.totalOrders.toString(), icon: Users, color: 'purple', trend: 'orders', up: true },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-${card.color}-100 shadow-xl shadow-${card.color}-900/5`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${card.color}-100 rounded-xl`}>
                    <card.icon size={22} className={`text-${card.color}-600`} />
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                    card.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {card.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {card.trend}
                  </span>
                </div>
                <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-black text-gray-800 mt-1">{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-amber-100 shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-amber-500" /> Hourly Revenue (Today)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #fcd34d', background: '#fffbeb' }}
                      formatter={(value: any) => [`₹${value ?? 0}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Popular Items */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-amber-100 shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Coffee size={20} className="text-amber-500" /> Popular Items
              </h3>
              <div className="space-y-4">
                {dashData.popularItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                      <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full" 
                          style={{ width: `${Math.min((item.count / (dashData.popularItems[0]?.count || 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-500">{item.count}</span>
                  </div>
                ))}
                {dashData.popularItems.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No order data yet</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* === ORDERS TAB === */}
      {activeTab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[250px] relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by order ID or phone..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              />
            </div>
            <div className="relative">
              <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none appearance-none cursor-pointer font-medium"
              >
                <option value="">All Status</option>
                <option value="WAITING">Waiting</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-amber-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50 border-b border-amber-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders
                    .filter(o => {
                      if (!searchTerm) return true;
                      const term = searchTerm.toLowerCase();
                      return (o.id?.toLowerCase().includes(term)) || (o.customerPhone?.toLowerCase().includes(term));
                    })
                    .map(order => (
                    <tr key={order.id} className="hover:bg-amber-50/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-gray-800 text-sm">
                        #{order.id?.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.items?.map(i => `${i.drinkType} x${i.quantity}`).join(', ')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                          order.customerType === 'VIP Premium' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {order.customerType || 'Regular'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          order.status === 'WAITING' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.arrivalTime ? new Date(order.arrivalTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => printReceipt({
                            orderId: order.id || 'unknown',
                            items: order.items.map(i => ({ name: i.drinkType, quantity: i.quantity, price: 150 })),
                            customerType: order.customerType || 'Regular',
                            date: order.arrivalTime ? new Date(order.arrivalTime).toLocaleString('en-IN') : 'N/A',
                            total: order.items.reduce((s, i) => s + i.quantity * 150, 0),
                            tax: order.items.reduce((s, i) => s + i.quantity * 150, 0) * 0.05,
                            grandTotal: order.items.reduce((s, i) => s + i.quantity * 150, 0) * 1.05,
                            paymentMethod: 'Card',
                            transactionId: 'N/A'
                          })}
                          className="p-2 rounded-lg hover:bg-amber-100 text-amber-700 transition"
                          title="Print Receipt"
                        >
                          <Printer size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {orders.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Package size={48} className="mx-auto mb-3 opacity-30" />
                <p>No orders found</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* === QR CODES TAB === */}
      {activeTab === 'qr' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 border border-amber-100 shadow-xl mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <QrCode className="text-amber-500" /> QR Code Table Ordering
            </h3>
            <p className="text-gray-500 mb-6">Generate unique QR codes for each table. Customers scan the code to order directly from their phone — no app needed.</p>
            
            <div className="flex flex-wrap gap-4 items-end mb-8">
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-2">Number of Tables</label>
                <input
                  type="number"
                  value={tableCount}
                  onChange={e => setTableCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  min="1" max="50"
                  className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-lg text-center"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={generateQRCodes}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/30 hover:shadow-xl transition"
              >
                Generate QR Codes
              </motion.button>
              {Object.keys(qrCodes).length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={printAllQR}
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition flex items-center gap-2"
                >
                  <Printer size={18} /> Print All
                </motion.button>
              )}
            </div>
          </div>

          {/* QR Grid */}
          {Object.keys(qrCodes).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.entries(qrCodes).map(([tableNum, src]) => (
                <motion.div
                  key={tableNum}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: parseInt(tableNum) * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-lg text-center"
                >
                  <img src={src} alt={`Table ${tableNum}`} className="w-full aspect-square rounded-xl mb-3" />
                  <p className="text-2xl font-black text-amber-800">Table {tableNum}</p>
                  <p className="text-xs text-gray-500 mt-1">Scan to order</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {loading && !dashData && (
        <div className="flex justify-center items-center h-64">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Coffee size={48} className="text-amber-500" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;
