import axios from 'axios';
import { API_URL } from '../config';

// Configure axios to suppress AWS SDK browser compatibility warnings
const axiosInstance = axios.create();

// Custom console handler to filter out AWS SDK browser compatibility warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('Module "util" has been externalized for browser compatibility')) {
    return; // Suppress AWS SDK browser compatibility warnings
  }
  originalConsoleWarn.apply(console, args);
};

const api = {
  get: (endpoint) => axiosInstance.get(`${API_URL}${endpoint}`),
  post: (endpoint, data) => axiosInstance.post(`${API_URL}${endpoint}`, data),
  put: (endpoint, data) => axiosInstance.put(`${API_URL}${endpoint}`, data),
  delete: (endpoint) => axiosInstance.delete(`${API_URL}${endpoint}`),
};

export default api;
