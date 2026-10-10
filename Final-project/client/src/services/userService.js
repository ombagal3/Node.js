import api from './api';

export const userService = {
  // Current user profile
  getProfile: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.patch('/users/me', profileData);
    return res.data;
  },

  // Admin user management
  getAllUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  getUserById: async (id) => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  createUser: async (userData) => {
    const res = await api.post('/admin/users', userData);
    return res.data;
  },

  updateUser: async (id, userData) => {
    const res = await api.patch(`/admin/users/${id}`, userData);
    return res.data;
  },

  updateUserStatus: async (id, isActive) => {
    const res = await api.patch(`/admin/users/${id}/status`, { isActive });
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },
};
