import React, { useState } from 'react'
import Menu from './components/Menu'
import QueueDashboard from './components/QueueDashboard'
import RequirementsChecklist from './components/RequirementsChecklist'
import TimingStatistics from './components/TimingStatistics'
import Simulation from './components/Simulation'

const App: React.FC = () => {
  const [view, setView] = useState<'menu' | 'dashboard' | 'requirements' | 'statistics' | 'simulation'>('menu')

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif"
    }}>
      {/* Premium Navbar */}
      <nav style={{
        background: 'linear-gradient(90deg, #2D1B1B 0%, #4A2C2A 50%, #3D2723 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        padding: '0',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(255, 193, 7, 0.2)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', fontWeight: '800', letterSpacing: '1px' }}>
              ☕ Coffee Queue
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#FFA500', fontSize: '0.85rem', fontWeight: '500' }}>Smart Queue Management</p>
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {[
              { label: 'Menu', value: 'menu', icon: '☕' },
              { label: 'Dashboard', value: 'dashboard', icon: '📊' },
              { label: 'Statistics', value: 'statistics', icon: '📈' },
              { label: 'Simulation', value: 'simulation', icon: '🎮' },
              { label: 'Checklist', value: 'requirements', icon: '✅' }
            ].map(btn => (
              <button
                key={btn.value}
                onClick={() => setView(btn.value as any)}
                style={{
                  padding: '12px 28px',
                  background: view === btn.value
                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: view === btn.value ? '#1a1a1a' : '#fff',
                  border: view === btn.value ? 'none' : '2px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  boxShadow: view === btn.value ? '0 4px 15px rgba(255, 215, 0, 0.4)' : 'none',
                  transform: view === btn.value ? 'scale(1.05)' : 'scale(1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{btn.icon}</span> {btn.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ minHeight: 'calc(100vh - 100px)', paddingTop: '20px' }}>
        {view === 'menu' && <Menu />}
        {view === 'dashboard' && <QueueDashboard />}
        {view === 'statistics' && <TimingStatistics />}
        {view === 'simulation' && <Simulation />}
        {view === 'requirements' && <RequirementsChecklist />}
      </main>
    </div>
  )
}

export default App
