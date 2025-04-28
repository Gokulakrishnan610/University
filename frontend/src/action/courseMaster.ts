import { useQueryData } from "@/hooks/useQueryData";
import { useMutationData } from "@/hooks/useMutationData";
import axios from "axios";
import api from "./api";
import { DepartmentDetails } from "./course";

// Types
export interface CourseMaster {
  id: number;
  course_id: string;
  course_name: string;
  course_dept_id: number;
  course_dept_detail: DepartmentDetails;
  lecture_hours: number;
  tutorial_hours: number;
  practical_hours: number;
  credits: number;
  course_type: string;
  is_zero_credit_course: boolean;
  regulation: string;
}

export interface CreateCourseMasterRequest {
  course_id: string;
  course_name: string;
  course_dept_id: number;
}

export type UpdateCourseMasterRequest = Partial<CreateCourseMasterRequest>;

// Get all course masters
export const useGetCourseMasters = () => {
  return useQueryData<CourseMaster[]>(
    ['course-masters'],
    async () => {
      try {
        const response = await api.get('/api/course-master/');
        return response.data || [];
      } catch (error) {
        console.error('Error fetching course masters:', error);
        return [];
      }
    }
  );
};

// Get a single course master by ID
export const useGetCourseMaster = (id: number) => {
  return useQueryData<CourseMaster>(
    ['course-master', id.toString()],
    async () => {
      try {
        const response = await api.get(`/api/course-master/${id}/`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching course master with ID ${id}:`, error);
        return {};
      }
    },
    !!id
  );
};

// Create a new course master
export const useCreateCourseMaster = (onSuccess?: () => void) => {
  return useMutationData(
    ['createCourseMaster'],
    async (data: CreateCourseMasterRequest) => {
      try {
        const response = await api.post('/api/course-master/', data);
        return {
          status: response.status,
          data: response.data.message || 'Course master created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error('Course master creation error:', error.response.data);
          return {
            status: error.response.status,
            data: error.response.data.message || error.response.data.detail || 'Failed to create course master',
          };
        }
        throw error;
      }
    },
    'course-masters',
    onSuccess
  );
};

// Update an existing course master
export const useUpdateCourseMaster = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateCourseMaster', id.toString()],
    async (data: UpdateCourseMasterRequest) => {
      try {
        const response = await api.put(`/api/course-master/${id}/`, data);
        return {
          status: response.status,
          data: response.data.message || 'Course master updated successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to update course master',
          };
        }
        throw error;
      }
    },
    [['course-masters'], ['course-master', id.toString()]],
    onSuccess
  );
};

// Delete a course master
export const useDeleteCourseMaster = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteCourseMaster', id.toString()],
    async () => {
      try {
        const response = await api.delete(`/api/course-master/${id}/`);
        return {
          status: response.status,
          data: response.data.message || 'Course master deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to delete course master',
          };
        }
        throw error;
      }
    },
    'course-masters',
    onSuccess
  );
}; 