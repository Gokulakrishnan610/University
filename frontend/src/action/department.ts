import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";

// Types
export interface Department {
  id: number;
  name: string;
  description: string;
  hod: number | null;
}

export interface CreateDepartmentRequest {
  name: string;
  description: string;
  hod?: number;
}

export type UpdateDepartmentRequest = Partial<CreateDepartmentRequest>;

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

// Get all departments
export const useGetDepartments = () => {
  return useQueryData(
    ['departments'],
    async () => {
      try {
        const response = await api.get('/department/');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch departments');
        }
        throw error;
      }
    }
  );
};

// Get a single department by ID
export const useGetDepartment = (id: number) => {
  return useQueryData(
    ['department', id.toString()],
    async () => {
      try {
        const response = await api.get(`/department/${id}/`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch department');
        }
        throw error;
      }
    }
  );
};

// Create a new department
export const useCreateDepartment = (onSuccess?: () => void) => {
  return useMutationData(
    ['createDepartment'],
    async (data: CreateDepartmentRequest) => {
      try {
        const response = await api.post('/department/', data);
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
        const response = await api.put(`/department/${id}/`, data);
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
        const response = await api.delete(`/department/${id}/`);
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