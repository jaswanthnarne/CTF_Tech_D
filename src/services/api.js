import axios from 'axios';

const API_BASE_URL = 'https://ctf-tech-d-backend.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // For admin routes, use adminToken
    if (config.url.includes('/admin/')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        console.log('🔐 Using admin token for:', config.url);
      }
    } else {
      // For student routes, use token
      const studentToken = localStorage.getItem('token');
      if (studentToken) {
        config.headers.Authorization = `Bearer ${studentToken}`;
        console.log('🔐 Using student token for:', config.url);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔒 401 Unauthorized - Clearing tokens');
      
      // Clear tokens based on the route
      if (error.config?.url?.includes('/admin/')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        if (window.location.pathname.includes('/admin')) {
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/admin')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;