import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";

// Types
export interface UserDetails {
  id: string;
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
  teacher_id?: UserDetails; // Alternative API structure
  dept_id?: DepartmentDetails | null; // Alternative API structure
  staff_code: string;
  teacher_role: string;
  teacher_specialisation: string;
  teacher_working_hours: number;
}

export interface CreateTeacherRequest {
  teacher_id: string; // User ID
  dept_id: number;
  staff_code?: string;
  teacher_role: string;
  teacher_specialisation?: string;
  teacher_working_hours: number;
}

export type UpdateTeacherRequest = {
  dept_id?: number | null;
  staff_code?: string;
  teacher_role?: string;
  teacher_specialisation?: string;
  teacher_working_hours?: number;
};

// Get all teachers
export const useGetTeachers = () => {
  return useQueryData(
    ['teachers'],
    async () => {
      const response = await api.get('/api/teachers/');
      return response.data || [];
    }
  );
};

// Get a single teacher by ID
export const useGetTeacher = (id: number) => {
  return useQueryData(
    ['teacher', id.toString()],
    async () => {
      try {
        const response = await api.get(`/api/teachers/${id}/`);
        
        // Handle different API response structures
        if (response.data?.data) {
          return response.data.data;
        } else if (response.data) {
          // If data is directly in the response without a data wrapper
          return response.data;
        }
        
        // Fallback to an empty object to avoid undefined return
        console.warn(`Teacher data for ID ${id} was not in expected format:`, response.data);
        return {}; 
      } catch (error) {
        console.error(`Error fetching teacher with ID ${id}:`, error);
        // Return empty object instead of undefined
        return {};
      }
    },
    !!id // enabled when id exists
  );
};

// Create a new teacher
export const useCreateTeacher = (onSuccess?: () => void) => {
  return useMutationData(
    ['createTeacher'],
    async (data: CreateTeacherRequest) => {
      try {
        const response = await api.post('/api/teachers/add/', data);
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
        // Create a copy of the data to avoid modifying the original
        const apiData = {...data};
        
        // Ensure dept_id is explicitly null when undefined
        if ('dept_id' in apiData && apiData.dept_id === undefined) {
          apiData.dept_id = null;
        }
        
        const response = await api.patch(`/api/teachers/${id}/`, apiData);
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
        const response = await api.delete(`/api/teachers/${id}/`);
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