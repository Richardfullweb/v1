import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - Replace with actual API call
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    phone: '(11) 99999-9999',
    location: 'São Paulo, SP',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=facearea&facepad=2&w=256&h=256&q=80',
    createdAt: '2024-03-15',
    status: 'ativo'
  },
  {
    id: '2',
    name: 'Event Organizer',
    email: 'organizer@example.com',
    password: 'organizer123',
    role: 'organizador',
    phone: '(11) 88888-8888',
    location: 'Rio de Janeiro, RJ',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=facearea&facepad=2&w=256&h=256&q=80',
    createdAt: '2024-03-14',
    status: 'ativo'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token and validate session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Mock authentication - Replace with actual API call
      const foundUser = mockUsers.find(
        u => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error('Invalid credentials');
      }

      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}