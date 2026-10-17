import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('verve_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('verve_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        }
      } catch (err) {
        console.warn('Stored auth session is no longer valid:', err.message);
        localStorage.removeItem('verve_token');
        localStorage.removeItem('verve_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    // Listen for session expiry event
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('verve_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('verve_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('verve_token', data.token);
      localStorage.setItem('verve_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout request failed:', err.message);
    } finally {
      localStorage.removeItem('verve_token');
      localStorage.removeItem('verve_user');
      setUser(null);
      setToken(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
