import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";
import { useQuery } from '@tanstack/react-query';

// Types
export interface Department {
  id: number;
  dept_name: string;
  date_established: string;
  contact_info: string;
  hod?: number;
}

export interface CreateDepartmentRequest {
  dept_name: string;
  date_established: string;
  contact_info?: string;
  hod: number;
}

export type UpdateDepartmentRequest = Partial<CreateDepartmentRequest>;

// Get all departments
export const useGetDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/api/departments/');
      return response.data.data || [];
    }
  });
};

// Get a single department by ID
export const useGetDepartment = (id: number) => {
  return useQuery({
    queryKey: ['department', id.toString()],
    queryFn: async () => {
      const response = await api.get(`/api/departments/${id}/`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Create a new department
export const useCreateDepartment = (onSuccess?: () => void) => {
  return useMutationData(
    ['createDepartment'],
    async (data: CreateDepartmentRequest) => {
      try {
        const response = await api.post('/api/department/', data);
        return {
          status: response.status,
          data: response.data.message || 'Department created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to create department',
          };
        }
        throw error;
      }
    },
    'departments',
    onSuccess
  );
};

// Update an existing department
export const useUpdateDepartment = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateDepartment', id.toString()],
    async (data: UpdateDepartmentRequest) => {
      try {
        const response = await api.put(`/api/department/${id}/`, data);
        return {
          status: response.status,
          data: response.data.message || 'Department updated successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to update department',
          };
        }
        throw error;
      }
    },
    [['departments'], ['department', id.toString()]],
    onSuccess
  );
};

// Delete a department
export const useDeleteDepartment = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteDepartment', id.toString()],
    async () => {
      try {
        const response = await api.delete(`/api/department/${id}/`);
        return {
          status: response.status,
          data: response.data.message || 'Department deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to delete department',
          };
        }
        throw error;
      }
    },
    'departments',
    onSuccess
  );
}; 