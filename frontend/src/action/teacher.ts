import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";

// Types
export interface UserDetails {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: string;
}

export interface DepartmentDetails {
  id: number;
  dept_name: string;
  date_established: string;
  contact_info: string;
}

export interface Teacher {
  id: number;
  teacher: UserDetails; // User details
  dept: DepartmentDetails; // Department details
  staff_code: string;
  teacher_role: string;
  teacher_specialisation: string;
  teacher_working_hours: number;
}

export interface CreateTeacherRequest {
  teacher: number; // User ID
  dept: number;
  staff_code?: string;
  teacher_role: string;
  teacher_specialisation?: string;
  teacher_working_hours: number;
}

export type UpdateTeacherRequest = Partial<CreateTeacherRequest>;

// Get all teachers
export const useGetTeachers = () => {
  return useQueryData(
    ['teachers'],
    async () => {
      try {
        const response = await api.get('/api/teacher/');
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
        const response = await api.get(`/api/teacher/${id}/`);
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
        const response = await api.post('/api/teacher/', data);
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
        const response = await api.put(`/api/teacher/${id}/`, data);
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
        const response = await api.delete(`/api/teacher/${id}/`);
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