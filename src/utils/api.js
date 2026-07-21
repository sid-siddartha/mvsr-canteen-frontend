import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('canteenease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent response and error handling
api.interceptors.response.use(
  (response) => {
    // Return the response data directly (e.g. { success: true, message: "...", data: ... })
    return response.data;
  },
  (error) => {
    // 1. Network / Server Offline Error
    if (!error.response) {
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection.',
        isNetworkError: true,
      });
    }

    const { status, data } = error.response;
    const friendlyMessage = data?.message || 'Something went wrong. Please try again.';

    // 2. JWT Token Expired / Unauthorized Access
    if (status === 401) {
      localStorage.removeItem('canteenease_token');
      // If currently inside staff view (excluding login page), redirect to login
      if (
        window.location.pathname.startsWith('/staff') &&
        window.location.pathname !== '/staff/login'
      ) {
        window.location.href = '/staff/login';
      }
      // If currently inside admin view (excluding login page), redirect to admin login
      if (
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        localStorage.removeItem('canteenease_admin_token');
        localStorage.removeItem('canteenease_admin_role');
        localStorage.removeItem('canteenease_admin_name');
        window.location.href = '/admin/login';
      }
      return Promise.reject({
        message: 'Your session has expired. Please sign in again.',
        isAuthError: true,
      });
    }

    // 3. Other API Errors (400, 404, 500, etc.)
    return Promise.reject({
      message: friendlyMessage,
      status,
    });
  }
);

export default api;
