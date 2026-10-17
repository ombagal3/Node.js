import api from './api';

export const dashboardService = {
  /**
   * Fetch live dashboard statistics (Admin)
   */
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};
