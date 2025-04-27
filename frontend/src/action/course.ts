import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';

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
  course_id: number;
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
  permissions?: {
    can_edit: boolean;
    can_delete: boolean;
    editable_fields: string[];
  };
  user_department_roles?: string[];
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
  status: string;
  owned_courses: {
    role: string;
    description: string;
    data: Course[];
  };
  teaching_courses: {
    role: string;
    description: string;
    data: Course[];
  };
  receiving_courses: {
    role: string;
    description: string;
    data: Course[];
  };
  for_dept_courses: {
    role: string;
    description: string;
    data: Course[];
  };
}

export interface CourseAssignmentStats {
  course_id: number;
  course_name: string;
  course_code: string;
  total_teachers: number;
  teachers: {
    teacher_id: number;
    teacher_name: string;
    semester: number;
    academic_year: number;
    student_count: number;
  }[];
}

// Get courses for current department
export const useGetCurrentDepartmentCourses = () => {
  return useQueryData<DepartmentCoursesResponse>(
    ['department-courses'],
    async () => {
      try {
        const response = await api.get('/api/department/courses/');
        return response.data || {
          owned_courses: { role: '', description: '', data: [] },
          teaching_courses: { role: '', description: '', data: [] },
          receiving_courses: { role: '', description: '', data: [] },
          for_dept_courses: { role: '', description: '', data: [] }
        };
      } catch (error) {
        console.error('Error fetching department courses:', error);
        return {
          owned_courses: { role: '', description: '', data: [] },
          teaching_courses: { role: '', description: '', data: [] },
          receiving_courses: { role: '', description: '', data: [] },
          for_dept_courses: { role: '', description: '', data: [] }
        };
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
export const useRequestCourseReassignment = (onSuccess?: (data?: any) => void) => {
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
          data: response.data.detail || 'Reassignment request sent successfully',
          error: null
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.detail || 'Failed to request reassignment',
            error: error.response.data
          };
        }
        throw error;
      }
    },
    'courses',
    onSuccess
  );
};

// Get resource allocations
export const useGetResourceAllocations = () => {
  return useQueryData<{
    incoming_allocations: ResourceAllocation[];
    outgoing_allocations: ResourceAllocation[];
    user_department_id: number;
    user_department_name: string;
  }>(
    ['resource-allocations'],
    async () => {
      try {
        const response = await api.get('/api/course/resource-allocation/');
        return response.data || {
          incoming_allocations: [],
          outgoing_allocations: [],
          user_department_id: 0,
          user_department_name: ''
        };
      } catch (error) {
        console.error('Error fetching resource allocations:', error);
        return {
          incoming_allocations: [],
          outgoing_allocations: [],
          user_department_id: 0,
          user_department_name: ''
        };
      }
    }
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

// Check for pending allocation requests
export const useCheckPendingAllocations = () => {
  return useQueryData<{
    hasPendingRequests: boolean;
    pendingCount: number;
  }>(
    ['pending-allocations'],
    async () => {
      try {
        const response = await api.get('/api/course/resource-allocation/');
        const data = response.data || {
          incoming_allocations: [],
          outgoing_allocations: [],
          user_department_id: 0,
          user_department_name: ''
        };

        // Check for pending allocations
        const pendingIncoming = data.incoming_allocations.filter((a: ResourceAllocation) => a.status === 'pending');
        const pendingCount = pendingIncoming.length;

        return {
          hasPendingRequests: pendingCount > 0,
          pendingCount
        };
      } catch (error) {
        console.error('Error checking pending allocations:', error);
        return {
          hasPendingRequests: false,
          pendingCount: 0
        };
      }
    },
    true // Enable the query
  );
};

export function useGetCourseAssignmentStats(courseId?: number) {
  const queryKey = courseId ? ['course-assignment-stats', courseId] : ['course-assignment-stats'];
  const url = courseId ? `/api/course/stats/${courseId}/` : '/api/course/stats/';

  return useQueryData<CourseAssignmentStats | CourseAssignmentStats[]>(
    queryKey,
    async () => {
      const response = await api.get(url);
      return response.data;
    }
  );
} 