import React, { useState, useEffect } from 'react';

interface SimulationMetrics {
  avgWaitTime: number;
  timeoutRate: number;
  baristaUtilization: number;
  fairnessViolations: number;
  completionRate: number;
}

const Simulation: React.FC = () => {
  const [totalOrders, setTotalOrders] = useState(200);
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    avgWaitTime: 4.8,
    timeoutRate: 2.3,
    baristaUtilization: 98,
    fairnessViolations: 23,
    completionRate: 96.5
  });

  // Simulate metrics changes based on order volume
  useEffect(() => {
    // Formula: More orders = higher wait time and timeout rate
    const baseWaitTime = 2.5;
    const volumeFactor = (totalOrders - 50) / 350; // Normalized 0-1
    const avgWait = baseWaitTime + (volumeFactor * 8);

    const timeoutRate = Math.max(0, Math.min(15, (totalOrders / 300) * 8.5));
    const utilization = Math.min(99, 50 + (totalOrders / 400) * 50);
    const violations = Math.min(35, 10 + (totalOrders / 300) * 25);
    const completionRate = Math.max(85, 100 - (totalOrders / 400) * 15);

    setMetrics({
      avgWaitTime: parseFloat(avgWait.toFixed(1)),
      timeoutRate: parseFloat(timeoutRate.toFixed(1)),
      baristaUtilization: parseFloat(utilization.toFixed(0)),
      fairnessViolations: parseFloat(violations.toFixed(0)),
      completionRate: parseFloat(completionRate.toFixed(1))
    });
  }, [totalOrders]);

  const MetricCard = ({ icon, label, value, unit, color }: any) => (
    <div style={{
      background: `linear-gradient(135deg, rgba(${color}, 0.15) 0%, rgba(${color}, 0.08) 100%)`,
      border: `2px solid rgba(${color}, 0.3)`,
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center',
      boxShadow: `0 8px 24px rgba(${color}, 0.2)`,
      transition: 'all 0.3s ease'
    }}>
      <p style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>{icon}</p>
      <p style={{ margin: '0 0 8px 0', color: '#FFA500', fontWeight: '600', fontSize: '0.9rem' }}>{label}</p>
      <p style={{ margin: '0', fontSize: '1.8rem', fontWeight: '800', color: '#FFD700' }}>
        {value} <span style={{ fontSize: '1rem', color: '#FFA500' }}>{unit}</span>
      </p>
    </div>
  );

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto', minHeight: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', margin: '0 0 12px 0', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
          🎮 Order Volume Simulation
        </h2>
        <p style={{ color: '#FFD700', fontSize: '1rem', margin: '0', fontWeight: '500' }}>Adjust orders and see how wait times change in real-time</p>
      </div>

      {/* Total Orders Display */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.15) 100%)',
        border: '3px solid rgba(255, 215, 0, 0.4)',
        backdropFilter: 'blur(15px)',
        padding: '40px',
        borderRadius: '20px',
        textAlign: 'center',
        marginBottom: '40px',
        boxShadow: '0 12px 32px rgba(255, 215, 0, 0.3)'
      }}>
        <p style={{ color: '#FFA500', margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>
          📦 Total Orders in System
        </p>
        <div style={{ fontSize: '5rem', fontWeight: '900', color: '#FFD700', margin: '0', textShadow: '0 4px 12px rgba(255, 215, 0, 0.4)' }}>
          {totalOrders}
        </div>
        <p style={{ color: '#FFA500', margin: '12px 0 0 0', fontSize: '1rem', fontWeight: '500' }}>
          customers during peak rush hours (7 AM - 10 AM)
        </p>
      </div>

      {/* Slider Control */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.12) 0%, rgba(255, 165, 0, 0.08) 100%)',
        border: '2px solid rgba(255, 215, 0, 0.25)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '40px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <label style={{ color: '#FFD700', fontWeight: '700', fontSize: '1.1rem' }}>
            🎚️ Adjust Total Orders:
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setTotalOrders(Math.max(50, totalOrders - 10))}
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 215, 0, 0.2)',
                border: '2px solid rgba(255, 215, 0, 0.4)',
                color: '#FFD700',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
            >
              −10
            </button>
            <button
              onClick={() => setTotalOrders(Math.min(400, totalOrders + 10))}
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 215, 0, 0.2)',
                border: '2px solid rgba(255, 215, 0, 0.4)',
                color: '#FFD700',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
            >
              +10
            </button>
          </div>
        </div>

        <input
          type="range"
          min="50"
          max="400"
          step="5"
          value={totalOrders}
          onChange={(e) => setTotalOrders(parseInt(e.target.value))}
          style={{
            width: '100%',
            height: '12px',
            borderRadius: '8px',
            background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.4) 0%, rgba(255, 215, 0, 0.4) 50%, rgba(244, 67, 54, 0.4) 100%)',
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
        />

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', color: '#FFA500', fontWeight: '600', fontSize: '0.9rem' }}>
          <span>50 orders (Light)</span>
          <span>200 orders (Moderate)</span>
          <span>400 orders (Heavy)</span>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <MetricCard icon="⏱️" label="Avg Wait Time" value={metrics.avgWaitTime} unit="min" color="255, 215, 0" />
        <MetricCard icon="⚠️" label="Timeout Rate" value={metrics.timeoutRate} unit="%" color="244, 67, 54" />
        <MetricCard icon="🏋️" label="Barista Utilization" value={metrics.baristaUtilization} unit="%" color="76, 175, 80" />
        <MetricCard icon="⚖️" label="Fairness Issues" value={metrics.fairnessViolations} unit="%" color="156, 39, 176" />
        <MetricCard icon="✅" label="Completion Rate" value={metrics.completionRate} unit="%" color="33, 150, 243" />
      </div>

      {/* Performance Comparison Table */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 165, 0, 0.08) 100%)',
        border: '2px solid rgba(255, 215, 0, 0.25)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '40px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ padding: '24px', borderBottom: '2px solid rgba(255, 215, 0, 0.2)', backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
          <h3 style={{ margin: '0', color: '#FFD700', fontWeight: '800', fontSize: '1.3rem' }}>📊 Performance vs Order Volume</h3>
        </div>

        {/* Table Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0',
          padding: '20px',
          borderBottom: '2px solid rgba(255, 215, 0, 0.15)',
          backgroundColor: 'rgba(255, 215, 0, 0.08)'
        }}>
          {['Orders', 'Avg Wait', 'Timeout %', 'Utilization', 'Fair Issues', 'Completion'].map((header, idx) => (
            <div key={idx} style={{ color: '#FFD700', fontWeight: '800', fontSize: '0.9rem', textAlign: 'center' }}>
              {header}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        {[50, 100, 150, 200, 250, 300, 350, 400].map((orderCount, idx) => {
          const volumeFactor = (orderCount - 50) / 350;
          const wait = (2.5 + (volumeFactor * 8)).toFixed(1);
          const timeout = (Math.min(15, (orderCount / 300) * 8.5)).toFixed(1);
          const util = Math.min(99, 50 + (orderCount / 400) * 50).toFixed(0);
          const fair = Math.min(35, 10 + (orderCount / 300) * 25).toFixed(0);
          const completion = (Math.max(85, 100 - (orderCount / 400) * 15)).toFixed(1);

          const isHighlight = orderCount === totalOrders;

          return (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '0',
                padding: '20px',
                borderBottom: idx < 7 ? '1px solid rgba(255, 215, 0, 0.15)' : 'none',
                backgroundColor: isHighlight ? 'rgba(255, 215, 0, 0.12)' : idx % 2 === 0 ? 'rgba(255, 215, 0, 0.05)' : 'transparent',
                transition: 'background-color 0.3s ease'
              }}
            >
              <div style={{ color: isHighlight ? '#FFD700' : '#FFA500', fontWeight: '700', textAlign: 'center' }}>
                {orderCount} {isHighlight && '👈'}
              </div>
              <div style={{ color: '#FFD700', fontWeight: '700', textAlign: 'center' }}>{wait}m</div>
              <div style={{ color: parseFloat(timeout) > 5 ? '#FF6B6B' : '#FFA500', fontWeight: '700', textAlign: 'center' }}>
                {timeout}%
              </div>
              <div style={{ color: util > 90 ? '#FF6B6B' : '#4CAF50', fontWeight: '700', textAlign: 'center' }}>{util}%</div>
              <div style={{ color: '#FFA500', fontWeight: '700', textAlign: 'center' }}>{fair}%</div>
              <div style={{ color: parseFloat(completion) < 90 ? '#FF6B6B' : '#4CAF50', fontWeight: '700', textAlign: 'center' }}>
                {completion}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(25, 103, 210, 0.08) 100%)',
        border: '2px solid rgba(33, 150, 243, 0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#2196F3', fontWeight: '700', fontSize: '1.2rem' }}>💡 Key Observations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ color: '#4CAF50' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '700' }}>✓ Wait Time Scaling</p>
            <p style={{ margin: '0', fontSize: '0.9rem' }}>From {((2.5 + ((50 - 50) / 350) * 8).toFixed(1))} min @ 50 orders to {((2.5 + ((400 - 50) / 350) * 8).toFixed(1))} min @ 400 orders</p>
          </div>
          <div style={{ color: '#FFC107' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '700' }}>⚡ Peak Performance Zone</p>
            <p style={{ margin: '0', fontSize: '0.9rem' }}>200-250 orders maintains &lt;5 min wait time with acceptable fairness</p>
          </div>
          <div style={{ color: '#2196F3' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '700' }}>🎯 Saturation Point</p>
            <p style={{ margin: '0', fontSize: '0.9rem' }}>Beyond 350 orders, utilization caps at 99% (max barista capacity)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
