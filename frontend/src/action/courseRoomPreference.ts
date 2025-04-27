import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";

// Types
export interface CourseRoomPreference {
  id: number;
  course_id: number;
  course_detail?: any;
  room_id: number;
  room_detail?: any;
  preference_level: number;
  preferred_for: 'GENERAL' | 'TL' | 'NTL';
  tech_level_preference: 'None' | 'Basic' | 'Advanced' | 'High-tech';
}

export interface CreateCourseRoomPreferenceRequest {
  course_id: number;
  room_id: number;
  preference_level: number;
  preferred_for: 'GENERAL' | 'TL' | 'NTL';
  tech_level_preference: 'None' | 'Basic' | 'Advanced' | 'High-tech';
}

export interface UpdateCourseRoomPreferenceRequest {
  preference_level?: number;
  preferred_for?: 'GENERAL' | 'TL' | 'NTL';
  tech_level_preference?: 'None' | 'Basic' | 'Advanced' | 'High-tech';
}

// Get all course room preferences for a course
export const useGetCourseRoomPreferences = (courseId: number) => {
  return useQueryData(
    ['courseRoomPreferences', courseId.toString()],
    async () => {
      try {
        const response = await api.get(`/api/courses/${courseId}/room-preferences/`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch course room preferences');
        }
        throw error;
      }
    }
  );
};

// Create a new course room preference
export const useCreateCourseRoomPreference = (courseId: number, onSuccess?: () => void) => {
  return useMutationData(
    ['createCourseRoomPreference', courseId.toString()],
    async (data: CreateCourseRoomPreferenceRequest) => {
      try {
        const response = await api.post(`/api/courses/${courseId}/room-preferences/`, data);
        return {
          status: response.status,
          data: response.data.message || 'Room preference created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to create room preference',
          };
        }
        throw error;
      }
    },
    ['courseRoomPreferences', courseId.toString()],
    onSuccess
  );
};

// Update an existing course room preference
export const useUpdateCourseRoomPreference = (id: number, courseId: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateCourseRoomPreference', id.toString()],
    async (data: UpdateCourseRoomPreferenceRequest) => {
      try {
        const response = await api.put(`/api/courses/${courseId}/room-preferences/${id}/`, data);
        return {
          status: response.status,
          data: response.data.message || 'Room preference updated successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to update room preference',
          };
        }
        throw error;
      }
    },
    [['courseRoomPreferences', courseId.toString()]],
    onSuccess
  );
};

// Delete a course room preference
export const useDeleteCourseRoomPreference = (id: number, courseId: number, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteCourseRoomPreference', id.toString()],
    async () => {
      try {
        const response = await api.delete(`/api/courses/${courseId}/room-preferences/${id}/`);
        return {
          status: response.status,
          data: response.data.message || 'Room preference deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to delete room preference',
          };
        }
        throw error;
      }
    },
    ['courseRoomPreferences', courseId.toString()],
    onSuccess
  );
}; 