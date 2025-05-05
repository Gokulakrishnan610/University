import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";
import { DepartmentDetails } from "./course";

// Type for course master
export interface CourseMaster {
  id: number;
  course_id: string;
  course_name: string;
  course_dept_id: number;
  course_dept_detail: DepartmentDetails;
  is_zero_credit_course: boolean;
  lecture_hours: number;
  practical_hours: number;
  tutorial_hours: number;
  credits: number;
  regulation: string;
  course_type: string;
}

export interface CreateCourseMasterRequest {
  course_id: string;
  course_name: string;
  course_dept_id: number;
}

export type UpdateCourseMasterRequest = Partial<CreateCourseMasterRequest>;

// Get all course masters
export const useGetCourseMasters = (searchParams?: URLSearchParams) => {
  return useQueryData<CourseMaster[]>(
    ['course-masters', searchParams?.toString()],
    async () => {
      try {
        const url = searchParams ? `/api/coursemaster/?${searchParams.toString()}` : '/api/coursemaster/';
        const response = await api.get(url);
        return response.data || [];
      } catch (error) {
        console.error('Error fetching course masters:', error);
        return [];
      }
    }
  );
};

// Get course master details
export const useGetCourseMaster = (id: number) => {
  return useQueryData<CourseMaster>(
    ['course-master', id.toString()],
    async () => {
      try {
        const response = await api.get(`/api/coursemaster/${id}/`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching course master with ID ${id}:`, error);
        return null;
      }
    },
    !!id
  );
};

// Create course master
export const useCreateCourseMaster = (onSuccess?: () => void) => {
  return useMutationData(
    ['createCourseMaster'],
    async (data: Partial<CourseMaster>) => {
      try {
        const response = await api.post('/api/coursemaster/', data);
        return {
          status: response.status,
          data: response.data || 'Course master created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data || 'Failed to create course master',
          };
        }
        throw error;
      }
    },
    'course-masters',
    onSuccess
  );
};

// Update course master
export const useUpdateCourseMaster = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateCourseMaster', id.toString()],
    async (data: Partial<CourseMaster>) => {
      try {
        const response = await api.patch(`/api/coursemaster/${id}/`, data);
        return {
          status: response.status,
          data: response.data || 'Course master updated successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data || 'Failed to update course master',
          };
        }
        throw error;
      }
    },
    [['course-masters'], ['course-master', id.toString()]],
    onSuccess
  );
};

// Delete course master
export const useDeleteCourseMaster = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteCourseMaster', id.toString()],
    async () => {
      try {
        const response = await api.delete(`/api/coursemaster/${id}/`);
        return {
          status: response.status,
          data: response.data || 'Course master deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data || 'Failed to delete course master',
          };
        }
        throw error;
      }
    },
    'course-masters',
    onSuccess
  );
}; 