import api from './api';

export const authService = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  logout: async () => {
    try {
      const res = await api.post('/auth/logout');
      return res.data;
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  verifyOtp: async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  },

  resetPassword: async (resetData) => {
    const res = await api.post('/auth/reset-password', resetData);
    return res.data;
  },
};
