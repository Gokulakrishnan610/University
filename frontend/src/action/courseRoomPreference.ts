import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";

// Types
export interface CourseRoomPreference {
  id: number;
  course_id: number;
  course_detail?: any;
  room_id?: number;
  room_detail?: any;
  preference_level: number;
  preferred_for: 'GENERAL' | 'TL' | 'NTL';
  tech_level_preference: 'None' | 'Basic' | 'Advanced' | 'High-tech';
  lab_type?: 'low-end' | 'mid-end' | 'high-end';
  lab_description?: string;
}

export interface CreateCourseRoomPreferenceRequest {
  course_id: number;
  room_id?: number;
  preference_level: number;
  preferred_for: 'GENERAL' | 'TL' | 'NTL';
  tech_level_preference: 'None' | 'Basic' | 'Advanced' | 'High-tech';
  lab_type?: 'low-end' | 'mid-end' | 'high-end';
  lab_description?: string;
}

export interface UpdateCourseRoomPreferenceRequest {
  preference_level?: number;
  preferred_for?: 'GENERAL' | 'TL' | 'NTL';
  tech_level_preference?: 'None' | 'Basic' | 'Advanced' | 'High-tech';
  lab_type?: 'low-end' | 'mid-end' | 'high-end';
  lab_description?: string;
}

// Get all course room preferences for a course
export const useGetCourseRoomPreferences = (courseId: number) => {
  return useQueryData<CourseRoomPreference[]>(
    ['courseRoomPreferences', courseId.toString()],
    async () => {
      try {
        const response = await api.get(`/api/course/${courseId}/room-preferences/`);
        return response.data as CourseRoomPreference[];
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorDetail = error.response.data.detail || 'Failed to fetch course room preferences';
          throw new Error(errorDetail);
        }
        throw error;
      }
    }
  );
};

// Create a new course room preference
export const useCreateCourseRoomPreference = (
  courseId: number, 
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  return useMutationData(
    ['createCourseRoomPreference', courseId.toString()],
    async (data: CreateCourseRoomPreferenceRequest) => {
      try {
        const response = await api.post(`/api/course/${courseId}/room-preferences/`, data);
        // Only return success responses
        if (response.status >= 200 && response.status < 300) {
          return {
            status: response.status,
            data: response.data.message || 'Room preference created successfully',
          };
        } else {
          // Handle non-success responses
          throw new Error(response.data?.detail || 'Failed to create room preference');
        }
      } catch (error) {
        // Re-throw error to trigger onError callback
        if (axios.isAxiosError(error) && error.response) {
          throw {
            status: error.response.status,
            data: error.response.data || { detail: 'Failed to create room preference' },
          };
        }
        throw error;
      }
    },
    ['courseRoomPreferences', courseId.toString()],
    onSuccess,
    onError
  );
};

// Update an existing course room preference
export const useUpdateCourseRoomPreference = (
  id: number, 
  courseId: number, 
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  return useMutationData(
    ['updateCourseRoomPreference', id.toString()],
    async (data: UpdateCourseRoomPreferenceRequest) => {
      try {
        const response = await api.put(`/api/course/${courseId}/room-preferences/${id}/`, data);
        // Only return success responses
        if (response.status >= 200 && response.status < 300) {
          return {
            status: response.status,
            data: response.data.message || 'Room preference updated successfully',
          };
        } else {
          // Handle non-success responses
          throw new Error(response.data?.detail || 'Failed to update room preference');
        }
      } catch (error) {
        // Re-throw error to trigger onError callback
        if (axios.isAxiosError(error) && error.response) {
          throw {
            status: error.response.status,
            data: error.response.data || { detail: 'Failed to update room preference' },
          };
        }
        throw error;
      }
    },
    [['courseRoomPreferences', courseId.toString()]],
    onSuccess,
    onError
  );
};

// Delete a course room preference
export const useDeleteCourseRoomPreference = (
  id: number, 
  courseId: number, 
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  return useMutationData(
    ['deleteCourseRoomPreference', id.toString()],
    async () => {
      try {
        const response = await api.delete(`/api/course/${courseId}/room-preferences/${id}/`);
        // Only return success responses
        if (response.status >= 200 && response.status < 300) {
          return {
            status: response.status,
            data: response.data.message || 'Room preference deleted successfully',
          };
        } else {
          // Handle non-success responses
          throw new Error(response.data?.detail || 'Failed to delete room preference');
        }
      } catch (error) {
        // Re-throw error to trigger onError callback
        if (axios.isAxiosError(error) && error.response) {
          throw {
            status: error.response.status,
            data: error.response.data || { detail: 'Failed to delete room preference' },
          };
        }
        throw error;
      }
    },
    ['courseRoomPreferences', courseId.toString()],
    onSuccess,
    onError
  );
}; 