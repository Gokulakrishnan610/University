import { useQueryData } from "@/hooks/useQueryData";
import { useMutationData } from "@/hooks/useMutationData";
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
  lecture_hours: number;
  tutorial_hours: number;
  practical_hours: number;
  credits: number;
  course_type: string;
  degree_type: string;
  is_zero_credit_course: boolean;
  regulation: string;
  permissions?: CourseMasterPermissions;
  related_courses_count?: number;
}

export interface CourseMasterPermissions {
  can_edit: boolean;
  can_delete: boolean;
  is_owner: boolean;
}

export interface CourseMasterStats {
  total_courses: number;
  theory_courses_count: number;
  lab_courses_count: number;
  combined_courses_count: number;
  zero_credit_courses_count: number;
  department_stats: {
    department_id: number;
    department_name: string;
    course_count: number;
  }[];
  regulation_stats: {
    regulation: string;
    course_count: number;
  }[];
}

export interface CreateCourseMasterRequest {
  course_id: string;
  course_name: string;
  course_dept_id: number;
  lecture_hours?: number;
  tutorial_hours?: number;
  practical_hours?: number;
  credits?: number;
  course_type?: string;
  degree_type?: string;
  is_zero_credit_course?: boolean;
  regulation?: string;
}

export type UpdateCourseMasterRequest = Partial<CreateCourseMasterRequest>;

// Get all course masters
export const useGetCourseMasters = (page: number = 1, pageSize: number = 10, searchQuery: string = '', departmentId?: string, courseType?: string) => {
  return useQueryData<{results: CourseMaster[], count: number}>(
    ['course-masters', page, pageSize, searchQuery, departmentId, courseType],
    async () => {
      try {
        const params: Record<string, string | number> = {
          page,
          page_size: pageSize
        };
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        if (departmentId && departmentId !== 'all') {
          params.department_id = departmentId;
        }
        
        if (courseType && courseType !== 'all') {
          params.course_type = courseType;
        }
        
        const response = await api.get('/api/course-master/', { params });
        return response.data || { results: [], count: 0 };
      } catch (error) {
        console.error('Error fetching course masters:', error);
        return { results: [], count: 0 };
      }
    }
  );
};

// Get course master stats
export const useGetCourseMasterStats = () => {
  return useQueryData<CourseMasterStats>(
    ['course-master-stats'],
    async () => {
      try {
        const response = await api.get('/api/course-master/stats/');
        return response.data || {
          total_courses: 0,
          theory_courses_count: 0,
          lab_courses_count: 0,
          combined_courses_count: 0,
          zero_credit_courses_count: 0,
          department_stats: [],
          regulation_stats: []
        };
      } catch (error) {
        console.error('Error fetching course master stats:', error);
        return {
          total_courses: 0,
          theory_courses_count: 0,
          lab_courses_count: 0,
          combined_courses_count: 0,
          zero_credit_courses_count: 0,
          department_stats: [],
          regulation_stats: []
        };
      }
    }
  );
};

// Get a single course master by ID
export const useGetCourseMaster = (id: number) => {
  return useQueryData<{data: CourseMaster, status: string}>(
    ['course-master', id.toString()],
    async () => {
      try {
        const response = await api.get(`/api/course-master/${id}/`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching course master with ID ${id}:`, error);
        return { status: "error", data: {} };
      }
    },
    !!id
  );
};

// Get related courses for a course master
export const useGetRelatedCourses = (courseId: number) => {
  return useQueryData<{count: number, courses: any[]}>(
    ['course-master-related', courseId.toString()],
    async () => {
      try {
        const response = await api.get(`/api/course-master/${courseId}/related-courses/`);
        return response.data || { count: 0, courses: [] };
      } catch (error) {
        console.error(`Error fetching related courses for course master ID ${courseId}:`, error);
        return { count: 0, courses: [] };
      }
    },
    !!courseId
  );
};

// Create a new course master
export const useCreateCourseMaster = (onSuccess?: () => void, onError?: (error: Error) => void) => {
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
          throw new Error(
            error.response.data.message ||
              error.response.data.detail ||
              'Failed to create course master'
          );
        }
        throw error;
      }
    },
    'course-masters',
    onSuccess,
    onError
  );
};

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
            error: error.response.data
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
            error: error.response.data
          };
        }
        throw error;
      }
    },
    'course-masters',
    onSuccess
  );
}; 