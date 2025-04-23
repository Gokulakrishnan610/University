import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  phone_number: string;
  is_active: boolean;
  user_type: string;
  date_joined: string;
  last_login: string | null;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface ProfileResponse {
  user: User;
  student?: {
    id: number;
    batch: number;
    current_semester: number;
    year: number;
    roll_no: string | null;
    student_type: string;
    degree_type: string;
    department?: {
      id: number;
      dept_name: string;
      date_established: string;
      contact_info: string;
    };
  };
  teacher?: {
    id: number;
    staff_code: string;
    teacher_role: string;
    teacher_specialisation: string;
    teacher_working_hours: number;
    department?: {
      id: number;
      dept_name: string;
      date_established: string;
      contact_info: string;
    };
  };
}

// Login user
export const useLogin = (onSuccess?: (result: any) => void) => {
  return useMutationData(
    ['login'],
    async (data: LoginRequest) => {
      try {
        const response = await api.post('/api/auth/login/', data);
        
        return {
          status: response.status,
          data: response.data.message || 'Login successful',
          user_type: response.data.user_type,
          code: response.data.code
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Login failed',
            code: error.response.data.code
          };
        }
        throw error;
      }
    },
    'currentUser',
    onSuccess
  );
};

// Get current user using HTTP cookies
export const useCurrentUser = () => {
  return useQueryData<ProfileResponse | null>(
    ['currentUser'],
    async () => {
      try {
        const response = await api.get('/api/auth/profile/');
        
        if (response.data && response.data.data) {
          return response.data.data as ProfileResponse;
        }
        throw new Error('Invalid server response');
      } catch (error) {
        // If server request fails, user is not authenticated
        return null;
      }
    },
    true // enabled by default
  );
};

// Clear auth cookies
export const clearAuthCookies = async () => {
  try {
    // Make a request to the logout endpoint to clear server-side cookies
    await api.post('/api/auth/logout/');
  } catch (error) {
    console.error('Failed to clear auth cookies:', error);
  }
};

// Logout user - clears cookies
export const useLogout = (onSuccess?: () => void) => {
  return useMutationData(
    ['logout'],
    async () => {
      try {
        // Send logout request to clear server-side cookies
        const response = await api.post('/api/auth/logout/');
        
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
        const response = await api.get('/api/auth/profile/');
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
        const response = await api.post('/api/auth/forgot_password/', data);
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