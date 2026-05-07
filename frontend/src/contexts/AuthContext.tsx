import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

interface UserData {
  username: string;
  token: string;
  role: 'ADMIN' | 'BARISTA';
}

interface AuthContextType {
  user: UserData | null;
  login: (username: string, token: string, role: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isBarista: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
  }, []);

  const login = (username: string, token: string, role: string) => {
    const userObj: UserData = { username, token, role: role as 'ADMIN' | 'BARISTA' };
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  const isAdmin = user?.role === 'ADMIN';
  const isBarista = user?.role === 'BARISTA';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isBarista }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
