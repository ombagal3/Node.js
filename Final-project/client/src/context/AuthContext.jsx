import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout api errors and clean local state
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  }, []);

  // Listen to logout events from api interceptor
  useEffect(() => {
    const handleForceLogout = () => {
      logout();
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [logout]);

  // Initial user verification
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          logout();
        }
      } catch (error) {
        // Token might be expired, let interceptor handle or log out
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, [logout]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      const { user: loggedInUser, accessToken } = res.data;
      setUser(loggedInUser);
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      const { user: registeredUser, accessToken } = res.data;
      setUser(registeredUser);
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(registeredUser));
    }
    return res;
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    isLoading,
    login,
    register,
    logout,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
