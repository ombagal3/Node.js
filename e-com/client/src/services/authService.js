import api from './api';

export const authService = {
  /**
   * Log in user
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register customer user
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Get currently authenticated user
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Log out user
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};
