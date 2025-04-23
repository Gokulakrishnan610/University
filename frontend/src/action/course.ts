import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";

// Types
export interface Course {
  id: number;
  course_name: string;
  course_code: string;
  course_description: string;
  course_semester: string;
  course_department: number;
  course_credits: number;
  course_teacher: number;
}

export interface CreateCourseRequest {
  course_name: string;
  course_code: string;
  course_description: string;
  course_semester: string;
  course_department: number;
  course_credits: number;
  course_teacher: number;
}

export type UpdateCourseRequest = Partial<CreateCourseRequest>;

// Get all courses
export const useGetCourses = () => {
  return useQueryData(
    ['courses'],
    async () => {
      try {
        const response = await api.get('/api/course/');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch courses');
        }
        throw error;
      }
    }
  );
};

// Get a single course by ID
export const useGetCourse = (id: number) => {
  return useQueryData(
    ['course', id.toString()],
    async () => {
      try {
        const response = await api.get(`/api/course/${id}/`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch course');
        }
        throw error;
      }
    }
  );
};

// Create a new course
export const useCreateCourse = (onSuccess?: () => void) => {
  return useMutationData(
    ['createCourse'],
    async (data: CreateCourseRequest) => {
      try {
        const response = await api.post('/api/course/', data);
        return {
          status: response.status,
          data: response.data.message || 'Course created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to create course',
          };
        }
        throw error;
      }
    },
    'courses',
    onSuccess
  );
};

// Update an existing course
export const useUpdateCourse = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateCourse', id.toString()],
    async (data: UpdateCourseRequest) => {
      try {
        const response = await api.put(`/api/course/${id}/`, data);
        return {
          status: response.status,
          data: response.data.message || 'Course updated successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to update course',
          };
        }
        throw error;
      }
    },
    [['courses'], ['course', id.toString()]],
    onSuccess
  );
};

// Delete a course
export const useDeleteCourse = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteCourse', id.toString()],
    async () => {
      try {
        const response = await api.delete(`/api/course/${id}/`);
        return {
          status: response.status,
          data: response.data.message || 'Course deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to delete course',
          };
        }
        throw error;
      }
    },
    'courses',
    onSuccess
  );
}; 