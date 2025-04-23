import axios from "axios";

// API configuration
export const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for cross-site requests
});

// Add interceptor to include auth token in requests
api.interceptors.request.use((config) => {
  // Include token from localStorage as a fallback
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Ensure that cookies are sent with each request
  config.withCredentials = true;
  
  return config;
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => {
    // If a response includes a new token, store it
    if (response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with an error status
      if (error.response.status === 401) {
        // Handle unauthorized (could redirect to login)
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api; 