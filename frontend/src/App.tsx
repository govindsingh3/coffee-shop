import { useState, useEffect } from 'react';
import './App.css';
import Menu from './components/Menu';
import QueueDashboard from './components/QueueDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'dashboard' | 'admin'>('menu');

  // Check for table parameter in URL (QR code ordering)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table');
    if (table) {
      sessionStorage.setItem('tableNumber', table);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      
      {/* Table indicator banner */}
      {sessionStorage.getItem('tableNumber') && currentView === 'menu' && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 px-4 text-sm font-bold">
          📍 Ordering from Table {sessionStorage.getItem('tableNumber')} — Your order will be delivered to your table!
        </div>
      )}
      
      <main className="w-full pt-8">
        {currentView === 'menu' && <Menu />}
        {currentView === 'dashboard' && <ProtectedDashboard />}
        {currentView === 'admin' && <ProtectedAdmin />}
      </main>
    </div>
  );
}

// Barista + Admin can access
const ProtectedDashboard = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Access Restricted</h2>
        <p className="text-gray-500 max-w-md">You need to be logged in as a Barista or Admin to view the Live Queue.</p>
      </div>
    );
  }
  return <QueueDashboard />;
};

// Only Admin can access
const ProtectedAdmin = () => {
  const { user, isAdmin } = useAuth();
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-purple-100 text-purple-600 p-4 rounded-full mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Access Required</h2>
        <p className="text-gray-500 max-w-md">Please login as an Admin to access the dashboard.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-amber-100 text-amber-600 p-4 rounded-full mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Only</h2>
        <p className="text-gray-500 max-w-md">This section is restricted to Admin users. Baristas can access the Live Queue instead.</p>
      </div>
    );
  }

  return <AdminDashboard />;
};

export default App;
