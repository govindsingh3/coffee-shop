import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Order {
  id: string;
  items: { drinkType: string; quantity: number }[];
  priorityScore: number;
  totalPrepTime?: number;
  arrivalTime?: string;
  customerType?: string;
  regular?: boolean;
}

interface QueueStats {
  totalOrders: number;
  avgWaitTime: number;
  timeoutRate: number;
}

const QueueDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<{ [key: string]: number }>({});
  const [calculatedStats, setCalculatedStats] = useState({
    totalOrders: 0,
    avgWaitTime: 0,
    timeoutRate: 0
  });

  // Calculate stats from orders
  useEffect(() => {
    const now = new Date().getTime();
    let totalWaitTime = 0;
    let timeoutCount = 0;
    const MAX_WAIT_TIME = 600; // 10 minutes in seconds

    orders.forEach((order) => {
      if (order.arrivalTime) {
        const arrivalTime = new Date(order.arrivalTime).getTime();
        const waitTime = (now - arrivalTime) / 1000; // in seconds
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

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const newCountdown: { [key: string]: number } = {};

      orders.forEach((order) => {
        if (order.arrivalTime && order.totalPrepTime) {
          const arrivalTime = new Date(order.arrivalTime).getTime();
          const readyTime = arrivalTime + (order.totalPrepTime * 1000);
          const remaining = Math.max(0, Math.floor((readyTime - now) / 1000));
          newCountdown[order.id] = remaining;
        }
      });

      setCountdown(newCountdown);
    }, 1000);

    return () => clearInterval(timer);
  }, [orders]);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/queue');
        setOrders(response.data.waitingOrders || []);
        setStats(response.data.stats || {});
      } catch (error) {
        console.error('Failed to fetch queue');
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#FFA500', fontSize: '1.3rem', fontWeight: '600' }}>
        ⏳ Loading queue data...
      </div>
    );
  }

  // Format time display
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '✅ Ready!';
    const minutes = (seconds / 60).toFixed(1);
    return `${minutes} min`;
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <div style={{
      background: `linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(${color}, 0.1) 100%)`,
      border: `2px solid rgba(${color}, 0.3)`,
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      textAlign: 'center',
      boxShadow: `0 8px 24px rgba(${color}, 0.2)`,
      transition: 'all 0.3s ease'
    }}>
      <p style={{ margin: '0 0 12px 0', fontSize: '2.5rem' }}>{icon}</p>
      <p style={{ margin: '0 0 8px 0', color: '#FFA500', fontWeight: '600', fontSize: '0.95rem' }}>{label}</p>
      <p style={{ margin: '0', fontSize: '2.2rem', fontWeight: '800', color: '#FFD700' }}>{value}</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', margin: '0 0 12px 0', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
          📊 Queue Status
        </h2>
        <p style={{ color: '#FFD700', fontSize: '1rem', margin: '0', fontWeight: '500' }}>Real-time order management & countdown timers</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard icon="📦" label="Total Orders" value={calculatedStats.totalOrders} color="255, 215, 0" />
        <StatCard 
          icon="⏱️" 
          label="Avg Wait Time" 
          value={calculatedStats.avgWaitTime > 0 ? `${Math.round(calculatedStats.avgWaitTime)}s` : '—'} 
          color="76, 175, 80" 
        />
        <StatCard 
          icon="⚠️" 
          label="Timeout Rate" 
          value={`${calculatedStats.timeoutRate.toFixed(1)}%`} 
          color="244, 67, 54" 
        />
      </div>

      {/* Orders List Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.8rem', color: '#FFD700', fontWeight: '700', margin: '0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          ⏳ Waiting Orders <span style={{ fontSize: '0.8rem', fontWeight: '400', color: '#FFA500', background: 'rgba(255, 215, 0, 0.2)', padding: '4px 12px', borderRadius: '20px' }}>{orders.length} orders</span>
        </h3>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
          border: '2px dashed rgba(255, 215, 0, 0.3)',
          borderRadius: '16px',
          color: '#FFA500',
          fontSize: '1.2rem',
          fontWeight: '600'
        }}>
          ☕ Queue is empty! Ready for new orders.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {orders.map((order, idx) => (
            <div
              key={order.id}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 165, 0, 0.08) 100%)',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Header Row */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.3rem',
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)'
                }}>
                  {idx + 1}
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#FFA500', fontWeight: '600' }}>Order ID</p>
                  <p style={{ margin: '0', fontSize: '1.1rem', fontFamily: 'monospace', color: '#FFD700', fontWeight: '700' }}>
                    #{order.id?.substring(0, 12) || 'NEW'}...
                  </p>
                </div>
              </div>

              {/* Order Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                {/* Items */}
                <div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#FFA500', fontWeight: '700' }}>☕ Items</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {order.items.map((item, i) => (
                      <span key={i} style={{ color: '#FFD700', fontWeight: '600', fontSize: '0.95rem' }}>
                        • {item.drinkType} <span style={{ color: '#FFA500' }}>× {item.quantity}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Priority Bar */}
                <div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#FFA500', fontWeight: '700' }}>🎯 Priority Level</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '120px', height: '12px', backgroundColor: 'rgba(255, 215, 0, 0.2)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(order.priorityScore, 30) * 3.33}%`,
                          background: order.priorityScore > 20
                            ? 'linear-gradient(90deg, #FF6B6B 0%, #EE5A52 100%)'
                            : order.priorityScore > 10
                            ? 'linear-gradient(90deg, #FFC107 0%, #FF9800 100%)'
                            : 'linear-gradient(90deg, #4CAF50 0%, #388E3C 100%)',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>
                    <span style={{ fontWeight: '800', color: '#FFD700', minWidth: '50px' }}>
                      {order.priorityScore.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Type Badge */}
                <div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#FFA500', fontWeight: '700' }}>👥 Customer Type</p>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: (order.customerType === 'Regular' || order.regular)
                      ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(56, 142, 60, 0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 100%)',
                    border: (order.customerType === 'Regular' || order.regular) ? '2px solid rgba(76, 175, 80, 0.5)' : '2px solid rgba(255, 215, 0, 0.5)',
                    borderRadius: '8px',
                    fontWeight: '700',
                    color: (order.customerType === 'Regular' || order.regular) ? '#A5D6A7' : '#FFD700',
                    fontSize: '0.95rem'
                  }}>
                    {(order.customerType === 'Regular' || order.regular) ? '👤 Regular' : '⭐ VIP'}
                  </div>
                </div>

                {/* Countdown Timer */}
                <div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#FFA500', fontWeight: '700' }}>⏲️ Ready In</p>
                  <div style={{
                    display: 'inline-block',
                    padding: '12px 20px',
                    background: countdown[order.id] === 0
                      ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(56, 142, 60, 0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 193, 7, 0.3) 0%, rgba(255, 152, 0, 0.2) 100%)',
                    border: countdown[order.id] === 0
                      ? '2px solid rgba(76, 175, 80, 0.5)'
                      : '2px solid rgba(255, 193, 7, 0.5)',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '1.2rem',
                    color: countdown[order.id] === 0 ? '#A5D6A7' : '#FFD700',
                    fontFamily: 'monospace'
                  }}>
                    {formatTime(countdown[order.id] || 0)}
                  </div>
                </div>

                {/* Prep Time */}
                <div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#FFA500', fontWeight: '700' }}>🍳 Prep Time</p>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(123, 31, 162, 0.2) 100%)',
                    border: '2px solid rgba(156, 39, 176, 0.4)',
                    borderRadius: '8px',
                    fontWeight: '700',
                    color: '#CE93D8',
                    fontSize: '0.95rem'
                  }}>
                    {order.totalPrepTime || 0} sec
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QueueDashboard;
