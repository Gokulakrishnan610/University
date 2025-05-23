import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";

// Types
export interface Student {
  id: number;
  student_detail: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    gender: string;
  };
  batch: number;
  current_semester: number;
  year: number;
  dept_detail: any;
  roll_no: string | null;
  student_type: string;
  degree_type: string;
}

export interface StudentStats {
  total: number;
  by_year: { year: number; count: number }[];
  by_semester: { current_semester: number; count: number }[];
  by_student_type: { student_type: string; count: number }[];
  by_degree_type: { degree_type: string; count: number }[];
}

export interface CreateStudentRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: string;
  batch: number;
  current_semester: number;
  year: number;
  dept_id?: number;
  roll_no?: string;
  student_type: string;
  degree_type: string;
}

export type UpdateStudentRequest = Partial<CreateStudentRequest>;

export interface DepartmentStudentCount {
  department_id: number;
  department_name: string;
  total_students: number;
  batch_breakdown: { batch: number; count: number }[];
  year_breakdown: { year: number; count: number }[];
  semester_breakdown: { current_semester: number; count: number }[];
}

// Get all students
export const useGetStudents = (
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = '',
  year?: number,
  semester?: number,
  studentType?: string
) => {
  return useQueryData(
    ['students', page, pageSize, searchQuery, year, semester, studentType],
    async () => {
      try {
        const response = await api.get('/api/students/', {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery || undefined,
            year: year || undefined,
            current_semester: semester || undefined,
            student_type: studentType || undefined
          }
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch students');
        }
        throw error;
      }
    }
  );
};

// Get student statistics
export const useGetStudentStats = () => {
  return useQueryData(
    ['studentStats'],
    async () => {
      try {
        const response = await api.get('/api/students/stats/');
        return response.data as StudentStats;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch student statistics');
        }
        throw error;
      }
    }
  );
};

// Get a single student by ID
export const useGetStudent = (id: number) => {
  return useQueryData(
    ['student', id.toString()],
    async () => {
      try {
        const response = await api.get(`/api/students/${id}/`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch student');
        }
        throw error;
      }
    }
  );
};

// Create a new student
export const useCreateStudent = (onSuccess?: () => void) => {
  return useMutationData(
    ['createStudent'],
    async (data: CreateStudentRequest) => {
      try {
        const response = await api.post('/api/students/', data);
        return {
          status: response.status,
          data: response.data.message || 'Student created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to create student',
          };
        }
        throw error;
      }
    },
    'students',
    onSuccess
  );
};

// Update an existing student
export const useUpdateStudent = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateStudent', id.toString()],
    async (data: UpdateStudentRequest) => {
      try {
        const response = await api.put(`/api/students/${id}/`, data);
        return {
          status: response.status,
          data: response.data.message || 'Student updated successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to update student',
          };
        }
        throw error;
      }
    },
    [['students'], ['student', id.toString()]],
    onSuccess
  );
};

// Delete a student
export const useDeleteStudent = (id: number = 0, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteStudent'],
    async (studentId: number) => {
      try {
        const response = await api.delete(`/api/students/${studentId}/`);
        return {
          status: response.status,
          data: response.data.message || 'Student deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to delete student',
          };
        }
        throw error;
      }
    },
    'students',
    onSuccess
  );
};

// Get department student count
export const useGetDepartmentStudentCount = (deptId: number) => {
  return useQueryData<DepartmentStudentCount>(
    ['department-student-count', deptId.toString()],
    async () => {
      try {
        const response = await api.get(`/api/students/department/${deptId}/student-count/`);
        return response.data as DepartmentStudentCount;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error('Failed to fetch department student count:', error.response.data);
        }
        return {
          department_id: deptId,
          department_name: '',
          total_students: 0,
          batch_breakdown: [],
          year_breakdown: [],
          semester_breakdown: []
        };
      }
    },
    !!deptId // Only enabled when deptId exists
  );
}; 