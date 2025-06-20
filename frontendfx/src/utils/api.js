import axios from 'axios';
import { API_URL } from '../config';

const api = {
  get: (endpoint) => axios.get(`${API_URL}${endpoint}`),
  post: (endpoint, data) => axios.post(`${API_URL}${endpoint}`, data),
  put: (endpoint, data) => axios.put(`${API_URL}${endpoint}`, data),
  delete: (endpoint) => axios.delete(`${API_URL}${endpoint}`),
};

export default api;
