import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";

// Types
export interface Teacher {
  id: number;
  teacher_id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  department: number;
  teacher_role: string;
}

export interface CreateTeacherRequest {
  teacher_id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  department: number;
  teacher_role: string;
}

export type UpdateTeacherRequest = Partial<CreateTeacherRequest>;

// Create axios instance with default config
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all teachers
export const useGetTeachers = () => {
  return useQueryData(
    ['teachers'],
    async () => {
      try {
        const response = await api.get('/teacher/');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch teachers');
        }
        throw error;
      }
    }
  );
};

// Get a single teacher by ID
export const useGetTeacher = (id: number) => {
  return useQueryData(
    ['teacher', id.toString()],
    async () => {
      try {
        const response = await api.get(`/teacher/${id}/`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch teacher');
        }
        throw error;
      }
    }
  );
};

// Create a new teacher
export const useCreateTeacher = (onSuccess?: () => void) => {
  return useMutationData(
    ['createTeacher'],
    async (data: CreateTeacherRequest) => {
      try {
        const response = await api.post('/teacher/', data);
        return {
          status: response.status,
          data: response.data.message || 'Teacher created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to create teacher',
          };
        }
        throw error;
      }
    },
    'teachers',
    onSuccess
  );
};

// Update an existing teacher
export const useUpdateTeacher = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateTeacher', id.toString()],
    async (data: UpdateTeacherRequest) => {
      try {
        const response = await api.put(`/teacher/${id}/`, data);
        return {
          status: response.status,
          data: response.data.message || 'Teacher updated successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to update teacher',
          };
        }
        throw error;
      }
    },
    [['teachers'], ['teacher', id.toString()]],
    onSuccess
  );
};

// Delete a teacher
export const useDeleteTeacher = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteTeacher', id.toString()],
    async () => {
      try {
        const response = await api.delete(`/teacher/${id}/`);
        return {
          status: response.status,
          data: response.data.message || 'Teacher deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to delete teacher',
          };
        }
        throw error;
      }
    },
    'teachers',
    onSuccess
  );
}; 