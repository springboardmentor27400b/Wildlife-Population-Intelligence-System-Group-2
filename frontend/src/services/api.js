import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.MODE === 'development') {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.MODE === 'development') {
      console.log(`[API Response] ${response.status}`, response.data);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.MODE === 'development') {
      console.error(`[API Error]`, error.response?.status, error.response?.data || error.message);
    }
    // Handle network errors (Backend unavailable)
    if (!error.response) {
      error.customMessage = "Backend is unavailable or database connection failed. Please ensure the server is running.";
    }
    return Promise.reject(error);
  }
);

export default api;
