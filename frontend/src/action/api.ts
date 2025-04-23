import axios from "axios";

// API configuration
export const API_URL = 'http://localhost:8000';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for cross-site requests
});

// Add interceptor to ensure cookies are sent with requests
api.interceptors.request.use((config) => {
  // Ensure that cookies are sent with each request
  config.withCredentials = true;
  
  return config;
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (could redirect to login)
      // The server will handle clearing the auth cookie
    }
    return Promise.reject(error);
  }
);

export default api; 