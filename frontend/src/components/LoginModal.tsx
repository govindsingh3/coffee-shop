import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Lock, User, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.username, response.data.token);
      toast.success('Successfully logged in!', { icon: '👋' });
      onClose();
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-full pointer-events-none" />
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition">
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <LogIn size={32} />
              </div>
              <h2 className="text-3xl font-black text-gray-800">Staff Login</h2>
              <p className="text-gray-500 font-medium">Access the Live Queue Dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600 ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    placeholder="Enter barista or admin"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
