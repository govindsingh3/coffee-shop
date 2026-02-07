import { useState } from 'react';
import './App.css';
import Menu from './components/Menu';
import QueueDashboard from './components/QueueDashboard';
import Statistics from './components/Statistics';
import BaristaDashboard from './components/BaristaDashboard';
import Navbar from './components/Navbar';

function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'dashboard' | 'statistics' | 'barista'>('menu');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="container mx-auto px-4 py-8">
        {currentView === 'menu' && <Menu />}
        {currentView === 'dashboard' && <QueueDashboard />}
        {currentView === 'statistics' && <Statistics />}
        {currentView === 'barista' && <BaristaDashboard />}
      </main>
    </div>
  );
}

export default App;
