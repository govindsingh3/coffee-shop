import { useState } from 'react';
import './App.css';
import Menu from './components/Menu';
import QueueDashboard from './components/QueueDashboard';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'dashboard'>('menu');

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="w-full pt-8">
        {currentView === 'menu' && <Menu />}
        {currentView === 'dashboard' && (
          <ProtectedDashboard />
        )}
      </main>
    </div>
  );
}

const ProtectedDashboard = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Access Restricted</h2>
        <p className="text-gray-500 max-w-md">You need to be logged in as a Barista or Admin to view the Live Queue Dashboard.</p>
      </div>
    );
  }
  return <QueueDashboard />;
};

export default App;
