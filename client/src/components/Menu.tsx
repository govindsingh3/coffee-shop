import React, { useState } from 'react';
import axios from 'axios';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

const MENU: MenuItem[] = [
  { id: '1', name: 'Espresso', price: 150, description: 'Classic strong shot' },
  { id: '2', name: 'Latte', price: 200, description: 'Creamy milk & espresso' },
  { id: '3', name: 'Cappuccino', price: 180, description: 'Rich & frothy' },
  { id: '4', name: 'Americano', price: 140, description: 'Bold & smooth' },
  { id: '5', name: 'Cold Brew', price: 120, description: 'Chilled perfection' },
  { id: '6', name: 'Mocha', price: 250, description: 'Chocolate & espresso' }
];

const Menu: React.FC = () => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  const handleAddToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id]--;
      else delete newCart[id];
      return newCart;
    });
  };

  const handlePlaceOrder = async () => {
    const items = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        drinkType: MENU.find(m => m.id === id)?.name || 'Unknown',
        quantity: qty
      }));

    if (items.length === 0) {
      setMessage('Add items to order!');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/orders', { items });
      setMessage('✅ Order placed! Check dashboard for status.');
      setCart({});
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('❌ Failed to place order');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const total = Object.entries(cart).reduce(
    (sum, [id, qty]) => sum + ((MENU.find(m => m.id === id)?.price || 0) * qty),
    0
  );

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', margin: '0 0 12px 0', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
          ☕ Order Your Coffee
        </h2>
        <p style={{ color: '#FFD700', fontSize: '1rem', margin: '0', fontWeight: '500' }}>Handcrafted beverages for your taste</p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '16px 20px',
          marginBottom: '30px',
          background: message.includes('✅') 
            ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(56, 142, 60, 0.3) 100%)'
            : 'linear-gradient(135deg, rgba(244, 67, 54, 0.3) 0%, rgba(211, 47, 47, 0.3) 100%)',
          border: message.includes('✅') ? '2px solid #4CAF50' : '2px solid #F44336',
          borderRadius: '12px',
          color: message.includes('✅') ? '#A5D6A7' : '#EF9A9A',
          fontSize: '1.1rem',
          fontWeight: '600',
          animation: 'slideIn 0.3s ease'
        }}>
          {message}
        </div>
      )}

      {/* Menu Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {MENU.map(item => (
          <div
            key={item.id}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              border: 'none',
              borderRadius: '16px',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.08) 100%)',
              backdropFilter: 'blur(10px)',
              boxShadow: hovered === item.id 
                ? '0 20px 40px rgba(255, 215, 0, 0.3)' 
                : '0 8px 20px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
              transform: hovered === item.id ? 'translateY(-8px)' : 'translateY(0)',
              cursor: 'pointer',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', color: '#FFD700', fontWeight: '700' }}>
              {item.name}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.95rem', color: '#FFA500' }}>
              {item.description}
            </p>
            <p style={{ margin: '0 0 20px 0', fontSize: '1.8rem', fontWeight: '800', color: '#FFD700' }}>
              ₹{item.price.toFixed(2)}
            </p>

            {/* Quantity Controls */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={() => handleRemoveFromCart(item.id)}
                style={{
                  padding: '8px 14px',
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                  transform: cart[item.id] ? 'scale(1)' : 'scale(0.9)',
                  opacity: cart[item.id] ? '1' : '0.6'
                }}
              >
                −
              </button>
              <span style={{ 
                minWidth: '50px', 
                textAlign: 'center', 
                fontSize: '1.3rem', 
                fontWeight: '800',
                color: '#FFD700'
              }}>
                {cart[item.id] || 0}
              </span>
              <button
                onClick={() => handleAddToCart(item.id)}
                style={{
                  padding: '8px 14px',
                  background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  transform: 'scale(1)',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)',
        border: '2px solid rgba(255, 215, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '600px',
        margin: '0 auto',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '1.8rem', color: '#FFD700', fontWeight: '700', textAlign: 'center' }}>
          📋 Order Summary
        </h3>

        {Object.entries(cart).filter(([_, qty]) => qty > 0).length === 0 ? (
          <p style={{ color: '#FFA500', textAlign: 'center', fontSize: '1.1rem', margin: '0', fontStyle: 'italic' }}>
            Your cart is empty. Choose drinks to begin! ☕
          </p>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              {Object.entries(cart)
                .filter(([_, qty]) => qty > 0)
                .map(([id, qty]) => {
                  const item = MENU.find(m => m.id === id);
                  return (
                    <div key={id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingBottom: '12px',
                      borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
                      marginBottom: '12px',
                      color: '#FFA500'
                    }}>
                      <span style={{ fontWeight: '600' }}>{item?.name} × {qty}</span>
                      <span style={{ fontWeight: '700', color: '#FFD700' }}>₹{((item?.price || 0) * qty).toFixed(2)}</span>
                    </div>
                  );
                })}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '2px solid rgba(255, 215, 0, 0.3)',
              fontSize: '1.4rem',
              fontWeight: '800',
              color: '#FFD700',
              marginBottom: '24px'
            }}>
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading 
                  ? 'linear-gradient(135deg, #999 0%, #777 100%)'
                  : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: loading ? '#fff' : '#1a1a1a',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.2rem',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(255, 215, 0, 0.4)',
                transition: 'all 0.3s ease',
                transform: loading ? 'scale(1)' : 'scale(1)',
                opacity: loading ? '0.7' : '1'
              }}
            >
              {loading ? '⏳ Placing Order...' : '🎯 Place Order'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Menu;