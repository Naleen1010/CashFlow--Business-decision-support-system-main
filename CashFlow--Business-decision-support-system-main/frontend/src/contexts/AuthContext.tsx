// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';

interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean; // Add this line
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Computed property for authentication status
  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Validate token by fetching user profile
          const profile = await api.getProfile();
          setUser(profile);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
          // Optionally redirect to login page
          window.location.href = '/login';
        }
      }
      setLoading(false);
    };
  
    checkAuth();
  }, []);
  
  const login = async (token: string) => {
    try {
      localStorage.setItem('token', token);
      const profile = await api.getProfile();
      
      // Store user information in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: profile.id,
        business_id: profile.business_id,
        username: profile.username,
        email: profile.email,
        role: profile.role
      }));
      
      setUser(profile);
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  };
  
  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated, // Add this line
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};