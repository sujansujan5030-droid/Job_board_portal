import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getDashboardPath = (role) => {
  if (role === 'employer') return '/employer/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/dashboard';
};

export default api;

