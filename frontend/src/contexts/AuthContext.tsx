import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

interface AuthContextType {
  user: { username: string; token: string } | null;
  login: (username: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ username: string; token: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
  }, []);

  const login = (username: string, token: string) => {
    const userObj = { username, token };
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
