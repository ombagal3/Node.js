import api from './api';

export const recordService = {
  // Admin record operations
  adminGetAllRecords: async (params = {}) => {
    const res = await api.get('/admin/records', { params });
    return res.data;
  },

  adminCreateRecord: async (recordData) => {
    const res = await api.post('/admin/records', recordData);
    return res.data;
  },

  adminGetRecordById: async (id) => {
    const res = await api.get(`/admin/records/${id}`);
    return res.data;
  },

  adminUpdateRecord: async (id, recordData) => {
    const res = await api.patch(`/admin/records/${id}`, recordData);
    return res.data;
  },

  adminDeleteRecord: async (id) => {
    const res = await api.delete(`/admin/records/${id}`);
    return res.data;
  },

  // User record operations
  getAvailableRecords: async (params = {}) => {
    const res = await api.get('/records/available', { params });
    return res.data;
  },

  getMyRecords: async (params = {}) => {
    const res = await api.get('/records/my', { params });
    return res.data;
  },

  createMyRecord: async (recordData) => {
    const res = await api.post('/records/my', recordData);
    return res.data;
  },

  getMyRecordById: async (id) => {
    const res = await api.get(`/records/my/${id}`);
    return res.data;
  },

  updateMyRecord: async (id, recordData) => {
    const res = await api.patch(`/records/my/${id}`, recordData);
    return res.data;
  },

  deleteMyRecord: async (id) => {
    const res = await api.delete(`/records/my/${id}`);
    return res.data;
  },
};
