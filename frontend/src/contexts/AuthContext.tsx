import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/src/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  family_id: string | null;
  family_name: string | null;
  default_currency: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pin: string) => Promise<void>;
  register: (name: string, email: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.setToken(storedToken);
        
        // Refresh user data
        try {
          const response = await api.getMe();
          setUser(response);
          await AsyncStorage.setItem('user', JSON.stringify(response));
        } catch (error) {
          // Token might be expired, clear auth
          await logout();
        }
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pin: string) => {
    const response = await api.login(email, pin);
    setToken(response.access_token);
    setUser(response.user);
    api.setToken(response.access_token);
    await AsyncStorage.setItem('token', response.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
  };

  const register = async (name: string, email: string, pin: string) => {
    const response = await api.register(name, email, pin);
    setToken(response.access_token);
    setUser(response.user);
    api.setToken(response.access_token);
    await AsyncStorage.setItem('token', response.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    api.setToken(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await api.getMe();
        setUser(response);
        await AsyncStorage.setItem('user', JSON.stringify(response));
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser, refreshUser }}>
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
