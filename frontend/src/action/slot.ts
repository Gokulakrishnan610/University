import { useQueryData } from "@/hooks/useQueryData";
import { useMutationData } from "@/hooks/useMutationData";
import axios from "axios";
import api from "./api";

export interface Slot {
  id: number;
  slot_name: string;
  slot_start_time: string;
  slot_end_time: string;
}

export interface TeacherSlotAssignment {
  id?: number;
  teacher: number;
  slot: number;
  day_of_week: number;
}

export interface SlotOperation {
  action: 'create' | 'update' | 'delete';
  slot_id: number;
  day_of_week: number;
}

// Get all slots
export const useGetSlots = () => {
  return useQueryData<Slot[]>(
    ['slots'],
    async () => {
      try {
        const response = await api.get('/api/slots/');
        return response.data.results || [];
      } catch (error) {
        console.error('Error fetching slots:', error);
        return [];
      }
    }
  );
};

export const useGetTeacherSlotAssignments = (day_of_week: number) => {
  return useQueryData<TeacherSlotAssignment[]>(
    ['teacher-slot-assignments', day_of_week],
    async () => {
      try {
        const response = await api.get('/api/teacher-slot-preference/', {
          params: { day_of_week }
        });
        return response.data.results || [];
      } catch (error) {
        console.error('Error fetching teacher slot assignments:', error);
        return [];
      }
    }
  );
};

// Save multiple teacher slot assignments
export const useSaveTeacherSlotAssignments = (onSuccess?: () => void) => {
  return useMutationData(
    ['saveTeacherSlotAssignments'],
    async (data: { teacher_id: number, operations: SlotOperation[] }) => {
      try {
        const response = await api.post('/api/teacher-slot-preference/', data);
        return {
          status: response.status,
          data: response.data || { message: 'Assignments saved successfully' },
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data || { error: 'Failed to save assignments' },
          };
        }
        throw error;
      }
    },
    'teacher-slot-assignments',
    onSuccess
  );
};

// Check if slot distribution follows 33% rule (2 teachers per slot for 6 total)
export const validateSlotDistribution = (
  assignments: { slotId: number, teacherId: number }[],
  totalTeachers: number
): { isValid: boolean; message?: string } => {
  // Count teachers per slot
  const teachersPerSlot: Record<number, number> = {};
  
  // Initialize counts for all slots
  FIXED_SLOTS.forEach(slot => {
    teachersPerSlot[slot.id] = 0;
  });
  
  // Count assignments
  assignments.forEach(assignment => {
    teachersPerSlot[assignment.slotId] = (teachersPerSlot[assignment.slotId] || 0) + 1;
  });
  
  // Calculate the target number per slot (33% of total)
  const targetPerSlot = Math.ceil(totalTeachers / 3);
  
  // Check if any slot exceeds the target
  for (const slotId in teachersPerSlot) {
    if (teachersPerSlot[slotId] > targetPerSlot) {
      const slotName = FIXED_SLOTS.find(s => s.id === Number(slotId))?.slot_name || `Slot ${slotId}`;
      return {
        isValid: false,
        message: `Slot ${slotName} has ${teachersPerSlot[slotId]} teachers assigned. Maximum allowed is ${targetPerSlot} (33% of total).`
      };
    }
  }
  
  return { isValid: true };
};

// Pre-defined slot data for A, B, C slots
export const FIXED_SLOTS = [
  {
    id: 1,
    slot_name: 'Slot A',
    slot_start_time: '08:00:00',
    slot_end_time: '15:00:00'
  },
  {
    id: 2,
    slot_name: 'Slot B',
    slot_start_time: '10:00:00',
    slot_end_time: '17:00:00'
  },
  {
    id: 3,
    slot_name: 'Slot C',
    slot_start_time: '12:00:00',
    slot_end_time: '19:00:00'
  }
]; 