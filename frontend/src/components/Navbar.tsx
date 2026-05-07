import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Menu as MenuIcon, LayoutDashboard, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';

interface NavbarProps {
  currentView: 'menu' | 'dashboard' | 'admin';
  setCurrentView: (view: 'menu' | 'dashboard' | 'admin') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { user, logout, isAdmin, isBarista } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setCurrentView('menu');
  };

  return (
    <>
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-amber-100 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentView('menu')}
        >
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/30">
            <Coffee className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-800 to-orange-600 tracking-tight">
            Bean & Brew
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2 bg-amber-50/50 p-1.5 rounded-2xl border border-amber-100"
        >
          {/* Order Menu — always visible */}
          <button
            onClick={() => setCurrentView('menu')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm ${
              currentView === 'menu'
                ? 'bg-white text-amber-700 shadow-md shadow-amber-900/5'
                : 'text-amber-700/60 hover:text-amber-700 hover:bg-white/50'
            }`}
          >
            <MenuIcon size={18} />
            Order Menu
          </button>
          
          {/* Live Queue — visible for barista + admin */}
          {user && (
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm ${
                currentView === 'dashboard'
                  ? 'bg-white text-amber-700 shadow-md shadow-amber-900/5'
                  : 'text-amber-700/60 hover:text-amber-700 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard size={18} />
              Live Queue
            </button>
          )}

          {/* Admin — visible only for admin */}
          {isAdmin && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm ${
                currentView === 'admin'
                  ? 'bg-white text-purple-700 shadow-md shadow-purple-900/5'
                  : 'text-purple-600/60 hover:text-purple-700 hover:bg-purple-50/50'
              }`}
            >
              <Shield size={18} />
              Admin
            </button>
          )}
          
          {/* User section */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Role badge */}
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {isAdmin ? '👑 Admin' : '☕ Barista'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm text-amber-700/60 hover:text-amber-700 hover:bg-white/50"
            >
              <User size={18} />
              Staff Login
            </button>
          )}
        </motion.div>
      </div>
    </nav>
    <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default Navbar;
