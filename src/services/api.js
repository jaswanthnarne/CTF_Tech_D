import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://ctf-tech-d-backend.vercel.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for both admin and student tokens
    const adminToken = localStorage.getItem('adminToken');
    const studentToken = localStorage.getItem('token') || localStorage.getItem('studentToken');
    
    // Use admin token for admin routes, student token for others
    if (config.url.includes('/admin/') && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (studentToken && !config.url.includes('/admin/')) {
      config.headers.Authorization = `Bearer ${studentToken}`;
    } else if (adminToken) {
      // Fallback to admin token if no student token
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (studentToken) {
      // Fallback to student token if no admin token
      config.headers.Authorization = `Bearer ${studentToken}`;
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
      // Determine which token to clear based on the request URL
      if (error.config?.url?.includes('/admin/')) {
        // Clear admin tokens for admin routes
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        // Redirect to admin login
        if (window.location.pathname.includes('/admin')) {
          window.location.href = '/admin/login';
        }
      } else {
        // Clear student tokens for student routes
        localStorage.removeItem('token');
        localStorage.removeItem('studentToken');
        localStorage.removeItem('user');
        // Redirect to student login
        if (!window.location.pathname.includes('/admin')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;