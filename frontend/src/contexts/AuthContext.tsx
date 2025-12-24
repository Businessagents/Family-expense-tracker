import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { api } from '@/src/services/api';
import { AppState, AppStateStatus } from 'react-native';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  default_currency: string;
  biometric_enabled: boolean;
  auto_lock_enabled: boolean;
  auto_lock_timeout: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLocked: boolean;
  biometricAvailable: boolean;
  login: (email: string, pin: string) => Promise<void>;
  register: (name: string, email: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  lockApp: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  // Check biometric availability
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  // Load stored auth on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Handle app state changes for auto-lock
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [user, lastActivity]);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Error checking biometric:', error);
      setBiometricAvailable(false);
    }
  };

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && user) {
      // Check if we should lock based on inactivity
      if (user.auto_lock_enabled) {
        const now = new Date();
        const timeSinceActivity = (now.getTime() - lastActivity.getTime()) / 1000 / 60;
        if (timeSinceActivity > user.auto_lock_timeout) {
          setIsLocked(true);
        }
      }
      setLastActivity(new Date());
    } else if (nextAppState === 'background') {
      setLastActivity(new Date());
    }
  }, [user, lastActivity]);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        api.setToken(storedToken);
        
        // Check if app should be locked
        if (parsedUser.auto_lock_enabled) {
          setIsLocked(true);
        }
        
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
    setIsLocked(false);
    api.setToken(response.access_token);
    await AsyncStorage.setItem('token', response.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setLastActivity(new Date());
  };

  const register = async (name: string, email: string, pin: string) => {
    const response = await api.register(name, email, pin);
    setToken(response.access_token);
    setUser(response.user);
    setIsLocked(false);
    api.setToken(response.access_token);
    await AsyncStorage.setItem('token', response.access_token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    setLastActivity(new Date());
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setIsLocked(false);
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

  const unlockWithPin = async (pin: string): Promise<boolean> => {
    try {
      await api.verifyPin(pin);
      setIsLocked(false);
      setLastActivity(new Date());
      return true;
    } catch (error) {
      return false;
    }
  };

  const unlockWithBiometric = async (): Promise<boolean> => {
    if (!biometricAvailable || !user?.biometric_enabled) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Family Finance',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setIsLocked(false);
        setLastActivity(new Date());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric auth error:', error);
      return false;
    }
  };

  const lockApp = () => {
    setIsLocked(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isLocked,
      biometricAvailable,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      unlockWithPin,
      unlockWithBiometric,
      lockApp,
    }}>
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
