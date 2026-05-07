import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Lock, User, X, Shield, Coffee } from 'lucide-react';
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
  const [loginType, setLoginType] = useState<'admin' | 'barista'>('barista');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { username: uname, token, role } = response.data;
      login(uname, token, role);
      
      if (role === 'ADMIN') {
        toast.success(`Welcome, Admin ${uname}! 👑`, { duration: 3000 });
      } else {
        toast.success(`Welcome, Barista ${uname}! ☕`, { duration: 3000 });
      }
      setUsername('');
      setPassword('');
      onClose();
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
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
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition z-10">
              <X size={24} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <LogIn size={32} />
              </div>
              <h2 className="text-3xl font-black text-gray-800">Staff Login</h2>
              <p className="text-gray-500 font-medium">Select your role and sign in</p>
            </div>

            {/* Role Selector */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => { setLoginType('barista'); setUsername(''); setPassword(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  loginType === 'barista' 
                    ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-md shadow-amber-500/10' 
                    : 'border-gray-200 text-gray-400 hover:border-gray-300'
                }`}
              >
                <Coffee size={18} />
                Barista
              </button>
              <button
                type="button"
                onClick={() => { setLoginType('admin'); setUsername(''); setPassword(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  loginType === 'admin' 
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md shadow-purple-500/10' 
                    : 'border-gray-200 text-gray-400 hover:border-gray-300'
                }`}
              >
                <Shield size={18} />
                Admin
              </button>
            </div>

            {/* Info Badge */}
            <div className={`rounded-xl p-3 mb-5 text-xs font-medium ${
              loginType === 'admin' 
                ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}>
              {loginType === 'admin' 
                ? '👑 Admin access: Dashboard, Analytics, QR Codes, Menu Management & Live Queue'
                : '☕ Barista access: Live Queue — View, complete orders & print bills'}
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
                    placeholder={loginType === 'admin' ? 'admin' : 'barista'}
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
                className={`w-full py-4 mt-6 text-white rounded-xl font-bold text-lg shadow-lg transition-all ${
                  loginType === 'admin'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40'
                }`}
              >
                {loading ? 'Authenticating...' : `Sign In as ${loginType === 'admin' ? 'Admin' : 'Barista'}`}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
