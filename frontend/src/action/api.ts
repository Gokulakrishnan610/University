import axios from "axios";

// API configuration
export const API_URL = 'http://localhost:8000';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  config.withCredentials = true;
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
 
    if (error.response && error.response.status === 401) {

    }
    return Promise.reject(error);
  }
);

export default api; 