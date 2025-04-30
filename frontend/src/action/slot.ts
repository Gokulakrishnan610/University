import { useQueryData } from "@/hooks/useQueryData";
import { useMutationData } from "@/hooks/useMutationData";
import axios from "axios";
import api from "./api";

// Types for slots
export interface Slot {
  id: number;
  slot_name: string;
  slot_start_time: string;
  slot_end_time: string;
}

export interface TeacherSlotAssignment {
  id: number;
  teacher: number;
  slot: number;
  day_of_week: number;
  slot_detail?: Slot;
  day_name?: string;
}

export interface CreateSlotAssignmentRequest {
  teacher: number;
  slot: number;
  day_of_week: number;
}

export type UpdateSlotAssignmentRequest = Partial<CreateSlotAssignmentRequest>;

// Get all slots
export const useGetSlots = () => {
  return useQueryData<Slot[]>(
    ['slots'],
    async () => {
      try {
        const response = await api.get('/api/slots/');
        return response.data || [];
      } catch (error) {
        console.error('Error fetching slots:', error);
        return [];
      }
    }
  );
};

// Get all slot assignments for a teacher
export const useGetTeacherSlotAssignments = (teacherId: number) => {
  return useQueryData<TeacherSlotAssignment[]>(
    ['teacher-slots', teacherId],
    async () => {
      try {
        const response = await api.get(`/api/teacher-slots/`, {
          params: { teacher: teacherId }
        });
        
        // Parse the data and add day names
        const assignments = response.data || [];
        return assignments.map((assignment: TeacherSlotAssignment) => {
          const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          return {
            ...assignment,
            day_name: dayNames[assignment.day_of_week]
          };
        });
      } catch (error) {
        console.error(`Error fetching slot assignments for teacher ${teacherId}:`, error);
        return [];
      }
    },
    !!teacherId
  );
};

// Create a new slot assignment
export const useCreateSlotAssignment = (teacherId: number, onSuccess?: () => void) => {
  return useMutationData(
    ['createSlotAssignment'],
    async (data: CreateSlotAssignmentRequest) => {
      try {
        const response = await api.post('/api/teacher-slots/', data);
        return {
          status: response.status,
          data: response.data.message || 'Slot assignment created successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || error.response.data.detail || 'Failed to create slot assignment',
          };
        }
        throw error;
      }
    },
    [['teacher-slots', teacherId?.toString()]],
    onSuccess
  );
};

// Delete a slot assignment
export const useDeleteSlotAssignment = (assignmentId: number, teacherId: number, onSuccess?: () => void) => {
  return useMutationData(
    ['deleteSlotAssignment', assignmentId?.toString()],
    async () => {
      try {
        const response = await api.delete(`/api/teacher-slots/${assignmentId}/`);
        return {
          status: response.status,
          data: response.data.message || 'Slot assignment deleted successfully',
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to delete slot assignment',
          };
        }
        throw error;
      }
    },
    [['teacher-slots', teacherId?.toString()]],
    onSuccess
  );
}; 