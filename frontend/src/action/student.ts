import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";

// Types
export interface Student {
  id: number;
  student: number; // User ID
  batch: number;
  current_semester: number;
  year: number;
  dept_detail: any;
  roll_no: string | null;
  student_type: string;
  degree_type: string;
}

export interface CreateStudentRequest {
  student: number; // User ID
  batch: number;
  current_semester: number;
  year: number;
  dept?: number;
  roll_no?: string;
  student_type: string;
  degree_type: string;
}

export type UpdateStudentRequest = Partial<CreateStudentRequest>;

// Get all students
export const useGetStudents = () => {
  return useQueryData(
    ['students'],
    async () => {
      try {
        const response = await api.get('/api/students/');
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
        const response = await api.get(`/api/students/${id}/`);
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
        const response = await api.post('/api/students/', data);
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
        const response = await api.put(`/api/students/${id}/`, data);
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
        const response = await api.delete(`/api/students/${id}/`);
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