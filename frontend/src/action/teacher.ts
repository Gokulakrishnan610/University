import { useMutationData } from "@/hooks/useMutationData";
import { useQueryData } from "@/hooks/useQueryData";
import axios from "axios";
import api from "./api";

// Types
export interface UserDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: string;
}

export interface DepartmentDetails {
  id: number;
  dept_name: string;
  date_established: string;
  contact_info: string;
}

export interface TeacherAvailability {
  id: number;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
}

export interface Teacher {
  id: number;
  teacher_id?: UserDetails; // Alternative API structure
  dept_id?: DepartmentDetails | null; // Alternative API structure
  staff_code: string;
  teacher_role: string;
  teacher_specialisation: string;
  teacher_working_hours: number;
  is_industry_professional?: boolean;
  availability_type?: 'regular' | 'limited';
  availability_slots?: TeacherAvailability[];
  resignation_status?: 'active' | 'resigning' | 'resigned';
  resignation_date?: string | null;
  is_placeholder?: boolean;
  placeholder_description?: string;
}

export interface CreateTeacherRequest {
  teacher_id: string; // User ID
  dept_id: number;
  staff_code?: string;
  teacher_role: string;
  teacher_specialisation?: string;
  teacher_working_hours: number;
  availability_type?: 'regular' | 'limited';
}

export type UpdateTeacherRequest = {
  dept_id?: number | null;
  staff_code?: string;
  teacher_role?: string;
  teacher_specialisation?: string;
  teacher_working_hours?: number;
  availability_type?: 'regular' | 'limited';
  resignation_status?: 'active' | 'resigning' | 'resigned';
  resignation_date?: string | null;
  is_placeholder?: boolean;
  placeholder_description?: string;
};

export interface CreateAvailabilityRequest {
  teacher: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface UpdateAvailabilityRequest {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
}

export interface CreatePlaceholderTeacherRequest {
  teacher_id?: string; // Optional for placeholders
  dept_id: number;
  staff_code?: string;
  teacher_role: string;
  teacher_specialisation?: string;
  teacher_working_hours: number;
  placeholder_description: string;
}

// Get all teachers
export const useGetTeachers = () => {
  return useQueryData(
    ['teachers'],
    async () => {
      const response = await api.get('/api/teachers/');
      return response.data || [];
    }
  );
};

// Get a single teacher by ID
export const useGetTeacher = (id: number) => {
  return useQueryData(
    ['teacher', id.toString()],
    async () => {
      try {
        const response = await api.get(`/api/teachers/${id}/`);
        
        // Handle different API response structures
        if (response.data?.data) {
          return response.data.data;
        } else if (response.data) {
          // If data is directly in the response without a data wrapper
          return response.data;
        }
        
        // Fallback to an empty object to avoid undefined return
        console.warn(`Teacher data for ID ${id} was not in expected format:`, response.data);
        return {}; 
      } catch (error) {
        console.error(`Error fetching teacher with ID ${id}:`, error);
        // Return empty object instead of undefined
        return {};
      }
    },
    !!id // enabled when id exists
  );
};

// Get POP teachers
export const useGetPOPTeachers = () => {
  return useQueryData(
    ['pop-teachers'],
    async () => {
      const response = await api.get('/api/teachers/pop/');
      return response.data || [];
    }
  );
};

// Get Industry Professional teachers
export const useGetIndustryProfessionals = () => {
  return useQueryData(
    ['industry-professional-teachers'],
    async () => {
      const response = await api.get('/api/teachers/industry-professionals/');
      return response.data || [];
    }
  );
};

// Create a new teacher
export const useCreateTeacher = (onSuccess?: () => void) => {
  return useMutationData(
    ['createTeacher'],
    async (data: CreateTeacherRequest) => {
      try {
        const response = await api.post('/api/teachers/add/', data);
        return {
          status: response.status,
          data: response.data.message || 'Teacher created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to create teacher',
          };
        }
        throw error;
      }
    },
    'teachers',
    onSuccess
  );
};

// Update an existing teacher
export const useUpdateTeacher = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateTeacher', id.toString()],
    async (data: UpdateTeacherRequest) => {
      try {
        // Create a copy of the data to avoid modifying the original
        const apiData = {...data};
        
        // Ensure dept_id is explicitly null when undefined
        if ('dept_id' in apiData && apiData.dept_id === undefined) {
          apiData.dept_id = null;
        }
        
        const response = await api.patch(`/api/teachers/${id}/`, apiData);
        return {
          status: response.status,
          data: response.data.message || 'Teacher updated successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to update teacher',
          };
        }
        throw error;
      }
    },
    [['teachers'], ['teacher', id.toString()]],
    onSuccess
  );
};

// Delete a teacher
export const useDeleteTeacher = (id: number, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteTeacher', id.toString()],
    async () => {
      try {
        const response = await api.delete(`/api/teachers/${id}/`);
        return {
          status: response.status,
          data: response.data.message || 'Teacher deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to delete teacher',
          };
        }
        throw error;
      }
    },
    'teachers',
    onSuccess
  );
};

// Get resigning teachers
export const useGetResigningTeachers = () => {
  return useQueryData(
    ['resigning-teachers'],
    async () => {
      const response = await api.get('/api/teachers/resigning/');
      return response.data || [];
    }
  );
};

// Get resigned teachers
export const useGetResignedTeachers = () => {
  return useQueryData(
    ['resigned-teachers'],
    async () => {
      const response = await api.get('/api/teachers/resigned/');
      return response.data || [];
    }
  );
};

// Get placeholder teachers
export const useGetPlaceholderTeachers = () => {
  return useQueryData(
    ['placeholder-teachers'],
    async () => {
      const response = await api.get('/api/teachers/placeholders/');
      return response.data || [];
    }
  );
};

// Create a placeholder teacher
export const useCreatePlaceholderTeacher = (onSuccess?: () => void) => {
  return useMutationData(
    ['createPlaceholderTeacher'],
    async (data: CreatePlaceholderTeacherRequest) => {
      try {
        const response = await api.post('/api/teachers/placeholder/create/', data);
        return {
          status: response.status,
          data: response.data.message || 'Placeholder teacher created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to create placeholder teacher',
          };
        }
        throw error;
      }
    },
    'teachers',
    onSuccess
  );
};

// Teacher Availability API Calls

// Get availability slots for a teacher
export const useGetTeacherAvailability = (teacherId: number) => {
  return useQueryData(
    ['teacher-availability', teacherId.toString()],
    async () => {
      const response = await api.get(`/api/teachers/availability/${teacherId}/teacher_availability/`);
      return response.data || [];
    },
    !!teacherId // only enabled when teacherId exists
  );
};

// Get current teacher's availability slots
export const useGetMyAvailability = () => {
  return useQueryData(
    ['my-availability'],
    async () => {
      const response = await api.get('/api/teachers/availability/my_availability/');
      return response.data || [];
    }
  );
};

// Create a new availability slot
export const useCreateAvailability = (onSuccess?: () => void) => {
  return useMutationData(
    ['createAvailability'],
    async (data: CreateAvailabilityRequest) => {
      try {
        const response = await api.post('/api/teachers/availability/', data);
        return {
          status: response.status,
          data: response.data || 'Availability created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to create availability',
          };
        }
        throw error;
      }
    },
    [['teacher-availability'], ['my-availability']],
    onSuccess
  );
};

// Update an existing availability slot
export const useUpdateAvailability = (id: number, teacherId: number, onSuccess?: () => void) => {
  return useMutationData(
    ['updateAvailability', id.toString()],
    async (data: UpdateAvailabilityRequest) => {
      try {
        const response = await api.patch(`/api/teachers/availability/${id}/`, data);
        return {
          status: response.status,
          data: response.data || 'Availability updated successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to update availability',
          };
        }
        throw error;
      }
    },
    [
      ['teacher-availability', teacherId.toString()], 
      ['my-availability']
    ],
    onSuccess
  );
};

// Delete an availability slot
export const useDeleteAvailability = (id: number, teacherId: number, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteAvailability', id.toString()],
    async () => {
      try {
        const response = await api.delete(`/api/teachers/availability/${id}/`);
        return {
          status: response.status,
          data: response.data || 'Availability deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to delete availability',
          };
        }
        throw error;
      }
    },
    [
      ['teacher-availability', teacherId.toString()], 
      ['my-availability']
    ],
    onSuccess
  );
}; 