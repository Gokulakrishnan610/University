import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";

// Types
export interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  department: number;
  batch: string;
  semester: string;
}

export interface CreateStudentRequest {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  date_of_birth: string;
  department: number;
  batch: string;
  semester: string;
}

export type UpdateStudentRequest = Partial<CreateStudentRequest>;

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

// Get all students
export const useGetStudents = () => {
  return useQueryData(
    ['students'],
    async () => {
      try {
        const response = await api.get('/student/');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch students');
        }
        throw error;
      }
    }
  );
};

// Get a single student by ID
export const useGetStudent = (id: number) => {
  return useQueryData(
    ['student', id.toString()],
    async () => {
      try {
        const response = await api.get(`/student/${id}/`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch student');
        }
        throw error;
      }
    }
  );
};

// Create a new student
export const useCreateStudent = (onSuccess?: () => void) => {
  return useMutationData(
    ['createStudent'],
    async (data: CreateStudentRequest) => {
      try {
        const response = await api.post('/student/', data);
        return {
          status: response.status,
          data: response.data.message || 'Student created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to create student',
          };
        }
        throw error;
      }
    },
    'students',
    onSuccess
  );
};

// Update an existing student
export const useUpdateStudent = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateStudent', id.toString()],
    async (data: UpdateStudentRequest) => {
      try {
        const response = await api.put(`/student/${id}/`, data);
        return {
          status: response.status,
          data: response.data.message || 'Student updated successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to update student',
          };
        }
        throw error;
      }
    },
    [['students'], ['student', id.toString()]],
    onSuccess
  );
};

// Delete a student
export const useDeleteStudent = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteStudent', id.toString()],
    async () => {
      try {
        const response = await api.delete(`/student/${id}/`);
        return {
          status: response.status,
          data: response.data.message || 'Student deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to delete student',
          };
        }
        throw error;
      }
    },
    'students',
    onSuccess
  );
}; 