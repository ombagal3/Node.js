import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('verve_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized/expired token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    // If 401 returned on protected route (except login/register attempts)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register')
    ) {
      localStorage.removeItem('verve_token');
      localStorage.removeItem('verve_user');
      // Dispatch custom event so AuthContext can update seamlessly
      window.dispatchEvent(new Event('verve_auth_expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
