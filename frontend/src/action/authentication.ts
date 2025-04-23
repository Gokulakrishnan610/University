import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

// Create axios instance with default config
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies
});

// Add interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login user
export const useLogin = (onSuccess?: () => void) => {
  return useMutationData(
    ['login'],
    async (data: LoginRequest) => {
      try {
        const response = await api.post('/auth/login/', data);
        
        // Store token in localStorage
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }

        // Store user info
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return {
          status: response.status,
          data: response.data.message || 'Login successful',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Login failed',
          };
        }
        throw error;
      }
    },
    'currentUser',
    onSuccess
  );
};

// Logout user
export const useLogout = (onSuccess?: () => void) => {
  return useMutationData(
    ['logout'],
    async () => {
      try {
        const response = await api.post('/auth/logout/');
        
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        return {
          status: response.status,
          data: response.data.message || 'Logout successful',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Logout failed',
          };
        }
        throw error;
      }
    },
    'currentUser',
    onSuccess
  );
};

// Get user profile
export const useGetProfile = () => {
  return useQueryData(
    ['profile'],
    async () => {
      try {
        const response = await api.get('/auth/profile/');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch profile');
        }
        throw error;
      }
    }
  );
};

// Forgot password
export const useForgotPassword = (onSuccess?: () => void) => {
  return useMutationData(
    ['forgotPassword'],
    async (data: ForgotPasswordRequest) => {
      try {
        const response = await api.post('/auth/forgot_password/', data);
        return {
          status: response.status,
          data: response.data.message || 'Password reset email sent',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to send reset email',
          };
        }
        throw error;
      }
    },
    undefined,
    onSuccess
  );
}; 