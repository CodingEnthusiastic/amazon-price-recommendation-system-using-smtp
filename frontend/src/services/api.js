import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store token
let authToken = null;

// Add auth token to requests
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor to ensure token is always included
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
      console.log(`📤 ${config.method.toUpperCase()} ${config.url} - Token: ${authToken.substring(0, 20)}...`);
    } else {
      console.warn(`⚠️ ${config.method.toUpperCase()} ${config.url} - NO TOKEN SET`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error(`❌ 401 Unauthorized: ${error.config.method.toUpperCase()} ${error.config.url}`);
      console.error('   Token present:', error.config.headers.Authorization ? 'Yes' : 'No');
    } else {
      console.error(`❌ ${error.response?.status || 'Network'} Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    }
    return Promise.reject(error);
  }
);

// User API
export const syncUser = () => api.post('/api/users/sync');
export const getUserStats = () => api.get('/api/users/stats');

// Products API
export const getProducts = () => api.get('/api/products');
export const addProduct = (data) => api.post('/api/products', data);
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/api/products/${id}`);
export const getPriceHistory = (id) => api.get(`/api/products/${id}/history`);
export const refreshProduct = (id) => api.post(`/api/products/${id}/refresh`);

export default api;
