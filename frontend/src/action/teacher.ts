import { useMutation, useQuery } from '@tanstack/react-query';
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

export type UpdateTeacherRequest = {
  dept?: number | null;
  staff_code?: string;
  teacher_role?: string;
  teacher_specialisation?: string;
  teacher_working_hours?: number;
};

// Get all teachers
export const useGetTeachers = () => {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await api.get('/api/teachers/');
      return response.data || [];
    }
  });
};

// Get a single teacher by ID
export const useGetTeacher = (id: number) => {
  return useQuery({
    queryKey: ['teacher', id.toString()],
    queryFn: async () => {
      const response = await api.get(`/api/teachers/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create a new teacher
export const useCreateTeacher = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: async (data: CreateTeacherRequest) => {
      const response = await api.post('/api/teachers/add/', data);
      return response.data;
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
    }
  });
};

// Update an existing teacher
export const useUpdateTeacher = (id: number, onSuccess?: () => void) => {
  return useMutation({
    mutationFn: async (data: UpdateTeacherRequest) => {
      console.log('Sending update data:', data); // Add this for debugging
      
      // Create a copy of the data to avoid modifying the original
      const apiData = {...data};
      
      // Ensure dept is explicitly null when undefined
      if ('dept' in apiData && apiData.dept === undefined) {
        apiData.dept = null;
      }
      
      const response = await api.patch(`/api/teachers/${id}/`, apiData);
      return response.data;
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
    }
  });
};

// Delete a teacher
export const useDeleteTeacher = (id: number, onSuccess?: () => void) => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/api/teachers/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
    }
  });
}; 