import React, { useState } from 'react';
import { api } from '../services/api';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

const Menu: React.FC = () => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isVIP, setIsVIP] = useState(false);

  const defaultMenu: MenuItem[] = [
    { id: '1', name: 'Espresso', price: 150, description: 'Classic strong coffee' },
    { id: '2', name: 'Latte', price: 200, description: 'Smooth milk and espresso' },
    { id: '3', name: 'Cappuccino', price: 180, description: 'Rich and creamy' },
    { id: '4', name: 'Americano', price: 140, description: 'Bold and smooth' },
    { id: '5', name: 'Cold Brew', price: 120, description: 'Refreshing chilled coffee' },
    { id: '6', name: 'Mocha', price: 250, description: 'Chocolate and espresso blend' }
  ];

  const handleQuantityChange = (id: string, delta: number) => {
    setCart(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const handlePlaceOrder = async () => {
    const items = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        drinkId: id,
        drinkType: defaultMenu.find(m => m.id === id)?.name || 'Unknown',
        quantity: qty
      }));

    if (items.length === 0) {
      setMessage('Please add items to your cart!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/orders', { items, regular: !isVIP });
      setMessage(`Order placed! Queue position: ${response.data.position || 'pending'}`);
      setCart({});
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = defaultMenu.find(m => m.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);

  return (
    <div className="max-w-6xl mx-auto fade-in-down">
      <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent text-center drop-shadow-lg">☕ Our Premium Menu</h2>
      <p className="text-center text-yellow-300 mb-8 text-lg font-semibold">Crafted with passion for every cup</p>

      {message && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-900 to-emerald-800 border-2 border-emerald-500 rounded-xl text-emerald-300 font-bold shadow-lg animate-bounce">
          ✨ {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {defaultMenu.map(item => (
          <div key={item.id} className="bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 duration-300 p-6 border-3 border-yellow-400 hover:border-yellow-300 scale-in">
            <div className="text-4xl mb-3 text-center">🍵</div>
            <h3 className="text-2xl font-black text-yellow-300 mb-2 text-center">{item.name}</h3>
            <p className="text-slate-300 mb-4 text-center italic">"{item.description}"</p>
            <p className="text-3xl font-black text-yellow-400 mb-6 text-center">₹{item.price.toFixed(2)}</p>
            
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={() => handleQuantityChange(item.id, -1)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all transform hover:scale-110 duration-200"
              >
                −
              </button>
              <span className="px-6 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg min-w-[4rem] text-center font-bold text-lg">
                {cart[item.id] || 0}
              </span>
              <button
                onClick={() => handleQuantityChange(item.id, 1)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-bold text-lg transition-all transform hover:scale-110 duration-200"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-3xl shadow-2xl p-8 border-3 border-yellow-400 fade-in-up">
        <h3 className="text-3xl font-black text-yellow-300 mb-6 text-center">📝 Order Summary</h3>
        
        {/* Customer Category Badge */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setIsVIP(!isVIP)}
            className={`px-8 py-3 rounded-full font-black text-lg transition-all transform duration-300 hover:scale-110 flex items-center gap-2 shadow-lg ${
              isVIP 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-3 border-pink-400 hover:shadow-pink-500/50' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-3 border-cyan-400 hover:shadow-cyan-500/50'
            }`}
          >
            {isVIP ? (
              <>
                <span className="text-2xl">👑</span>
                <span>VIP Customer</span>
              </>
            ) : (
              <>
                <span className="text-2xl">☕</span>
                <span>Regular Customer</span>
              </>
            )}
          </button>
        </div>

        <div className="mb-6 max-h-48 overflow-y-auto bg-slate-700 rounded-xl p-4 border-2 border-slate-600">
          {Object.entries(cart)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => {
              const item = defaultMenu.find(m => m.id === id);
              return (
                <div key={id} className="flex justify-between items-center py-3 px-4 border-b border-slate-600 last:border-b-0 hover:bg-slate-600 rounded transition">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🍵</span>
                    <div>
                      <p className="font-bold text-yellow-300">{item?.name}</p>
                      <p className="text-xs text-slate-400">Qty: <span className="font-bold text-yellow-300">{qty}</span></p>
                    </div>
                  </div>
                  <span className="font-black text-yellow-400">₹{((item?.price || 0) * qty).toFixed(2)}</span>
                </div>
              );
            })}
          {Object.values(cart).every(qty => qty === 0) && (
            <div className="text-center py-8 text-slate-500 font-semibold">
              <p className="text-3xl mb-2">🛒</p>
              <p>Your cart is empty</p>
            </div>
          )}
        </div>

        <div className="border-t-4 border-yellow-400 pt-6 mb-8 flex justify-between items-center bg-slate-700 p-4 rounded-xl">
          <span className="text-3xl font-black text-yellow-300">💰 Total:</span>
          <span className="text-4xl font-black text-yellow-400">₹{total.toFixed(2)}</span>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading || Object.values(cart).every(qty => qty === 0)}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-slate-600 disabled:to-slate-700 text-slate-900 font-black py-4 rounded-xl transition-all transform hover:scale-105 hover:-translate-y-1 duration-300 text-lg shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Placing Order...' : '✨ Place Order Now'}
        </button>
      </div>
    </div>
  );
};

export default Menu;
