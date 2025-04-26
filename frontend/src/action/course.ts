import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";

// Types
export interface DepartmentDetails {
  id: number;
  dept_name: string;
  date_established: string;
  contact_info: string;
}

export interface CourseMaster {
  id: number;
  course_id: string;
  course_name: string;
  course_dept_detail: DepartmentDetails;
}

export interface Course {
  id: number;
  course_id: CourseMaster;
  course_detail: CourseMaster;
  course_year: number;
  course_semester: number;
  is_zero_credit_course: boolean;
  lecture_hours: number;
  practical_hours: number;
  tutorial_hours: number;
  credits: number;
  for_dept_id: number;
  for_dept_detail: DepartmentDetails;
  teaching_dept_id: number;
  teaching_dept_detail: DepartmentDetails;
  need_assist_teacher: boolean;
  regulation: string;
  course_type: string;
  elective_type: string;
  lab_type: string | null;
  no_of_students: number;
  teaching_status: 'active' | 'inactive' | 'pending';
  relationship_type: {
    code: string;
    description: string;
  };
}

export interface ResourceAllocation {
  id: number;
  course_id: number;
  course_detail: Course;
  original_dept_id: number;
  original_dept_detail: DepartmentDetails;
  teaching_dept_id: number;
  teaching_dept_detail: DepartmentDetails;
  allocation_reason: string;
  allocation_date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DepartmentCoursesResponse {
  owned_courses: Course[];
  teaching_courses: Course[];
  receiving_courses: Course[];
}

// Get courses for current department
export const useGetCurrentDepartmentCourses = () => {
  return useQueryData<DepartmentCoursesResponse>(
    ['department-courses'],
    async () => {
      try {
        const response = await api.get('/api/department/courses/');
        return response.data || { owned_courses: [], teaching_courses: [], receiving_courses: [] };
      } catch (error) {
        console.error('Error fetching department courses:', error);
        return { owned_courses: [], teaching_courses: [], receiving_courses: [] };
      }
    }
  );
};

// Get course details
export const useGetCourse = (id: number) => {
  return useQueryData<{ status: string; data: Course }>(
    ['course', id.toString()],
    async () => {
      try {
        const response = await api.get(`/api/course/${id}/`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching course with ID ${id}:`, error);
        return { status: "error", data: {} };
      }
    },
    !!id
  );
};

// Create course
export const useCreateCourse = (onSuccess?: () => void) => {
  return useMutationData(
    ['createCourse'],
    async (data: any) => {
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

// Update course
export const useUpdateCourse = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateCourse', id.toString()],
    async (data: any) => {
      try {
        const response = await api.patch(`/api/course/${id}/`, data);
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

// Request course reassignment
export const useRequestCourseReassignment = (onSuccess?: () => void) => {
  return useMutationData(
    ['requestReassignment'],
    async (data: {
      course_id: number;
      teaching_dept_id: number;
      allocation_reason: string;
    }) => {
      try {
        const response = await api.post('/api/course/resource-allocation/', data);
        return {
          status: response.status,
          data: response.data.message || 'Reassignment request sent successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to request reassignment',
          };
        }
        throw error;
      }
    },
    'courses',
    onSuccess
  );
};

// Respond to resource allocation request
export const useRespondToAllocationRequest = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['respondAllocation', id.toString()],
    async (data: { status: 'approved' | 'rejected' }) => {
      try {
        const response = await api.patch(`/api/course/resource-allocation/${id}/`, data);
        return {
          status: response.status,
          data: response.data.message || 'Response submitted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to respond to request',
          };
        }
        throw error;
      }
    },
    'resource-allocations',
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

// Get all courses
export const useGetCourses = () => {
  return useQueryData<Course[]>(
    ['courses'],
    async () => {
      try {
        const response = await api.get('/api/course/');
        return response.data || [];
      } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
      }
    }
  );
}; 