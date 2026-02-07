import React from 'react';

interface NavbarProps {
  currentView: 'menu' | 'dashboard' | 'statistics' | 'barista';
  setCurrentView: (view: 'menu' | 'dashboard' | 'statistics' | 'barista') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-b-4 border-yellow-400">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
          ☕ Coffee Queue
        </h1>
        <div className="space-x-3">
          <button
            onClick={() => setCurrentView('menu')}
            className={`px-6 py-3 rounded-lg font-bold transition-all transform duration-300 ${
              currentView === 'menu'
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 shadow-lg scale-105'
                : 'bg-slate-700 hover:bg-slate-600 hover:scale-105 text-white shadow-md border-2 border-slate-600'
            }`}
          >
            🍽️ Menu
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-6 py-3 rounded-lg font-bold transition-all transform duration-300 ${
              currentView === 'dashboard'
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 shadow-lg scale-105'
                : 'bg-slate-700 hover:bg-slate-600 hover:scale-105 text-white shadow-md border-2 border-slate-600'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setCurrentView('statistics')}
            className={`px-6 py-3 rounded-lg font-bold transition-all transform duration-300 ${
              currentView === 'statistics'
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 shadow-lg scale-105'
                : 'bg-slate-700 hover:bg-slate-600 hover:scale-105 text-white shadow-md border-2 border-slate-600'
            }`}
          >
            📈 Statistics
          </button>
          <button
            onClick={() => setCurrentView('barista')}
            className={`px-6 py-3 rounded-lg font-bold transition-all transform duration-300 ${
              currentView === 'barista'
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 shadow-lg scale-105'
                : 'bg-slate-700 hover:bg-slate-600 hover:scale-105 text-white shadow-md border-2 border-slate-600'
            }`}
          >
            👨‍🍳 Baristas
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
