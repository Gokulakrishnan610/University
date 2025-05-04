import { useQueryData } from "@/hooks/useQueryData";
import { useMutationData } from "@/hooks/useMutationData";
import axios from "axios";
import api from "./api";

export interface Slot {
  id: number;
  slot_name: string;
  slot_type: string;
  slot_type_display: string;
  slot_start_time: string;
  slot_end_time: string;
}

export interface TeacherSlotAssignment {
  id?: number;
  teacher: number;
  slot: Slot;
  day_of_week: number;
  day_name?: string;
}

export interface SlotOperation {
  action: 'create' | 'update' | 'delete';
  slot_id: number;
  day_of_week: number;
}

export interface DepartmentSummary {
  department: string;
  total_teachers: number;
  teachers_with_assignments: number;
  unassigned_teachers: number;
  slot_distribution: Record<string, {
    name: string;
    days: Record<string, {
      teacher_count: number;
      percentage: number;
      teachers: { id: number; name: string }[];
    }>;
  }>;
  day_distribution: Record<string, {
    total_teachers: number;
    slot_distribution: Record<string, {
      teacher_count: number;
      percentage: number;
    }>;
  }>;
  days_assigned_distribution: Record<string, number>;
  slot_type_summary: Record<string, {
    teacher_count: number;
    percentage: number;
  }>;
  compliance: {
    status: "Compliant" | "Non-Compliant";
    issues: string[];
  };
}

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

// Initialize default slots (A, B, C)
export const useInitializeDefaultSlots = (onSuccess?: () => void) => {
  return useMutationData(
    ['initializeDefaultSlots'],
    async () => {
      try {
        const response = await api.post('/api/slots/initialize-default-slots/');
        return {
          status: response.status,
          data: response.data || { message: 'Default slots initialized successfully' }
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data || { error: 'Failed to initialize default slots' }
          };
        }
        throw error;
      }
    },
    'slots',
    onSuccess
  );
};

// Get teacher slot assignments by day, teacher, or department
export const useGetTeacherSlotAssignments = (params: {
  day_of_week?: number;
  teacher_id?: number;
  dept_id?: number;
  slot_type?: string;
  include_stats?: boolean;
}) => {
  return useQueryData<{
    assignments: TeacherSlotAssignment[];
    stats?: any;
  }>(
    ['teacher-slot-assignments', JSON.stringify(params)],
    async () => {
      try {
        const response = await api.get('/api/slots/teacher-slots/', { params });
        if (params.include_stats) {
          return {
            assignments: response.data.assignments || [],
            stats: response.data.stats || {}
          };
        }
        return { assignments: response.data || [] };
      } catch (error) {
        console.error('Error fetching teacher slot assignments:', error);
        return { assignments: [] };
      }
    }
  );
};

// Get department summary
export const useGetDepartmentSummary = (deptId: number) => {
  return useQueryData<DepartmentSummary>(
    ['department-slot-summary', deptId.toString()],
    async () => {
      try {
        const response = await api.get('/api/slots/department-summary/', {
          params: { dept_id: deptId }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching department summary:', error);
        throw error;
      }
    },
    !!deptId // Only run when deptId is provided
  );
};

// Save multiple teacher slot assignments
export const useSaveTeacherSlotAssignments = (onSuccess?: () => void) => {
  return useMutationData(
    ['saveTeacherSlotAssignments'],
    async (data: { teacher_id: number, operations: SlotOperation[] }) => {
      try {
        const response = await api.post('/api/slots/teacher-slot-preference/', data);
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
    ['teacher-slot-assignments'],
    onSuccess
  );
};

// Save batch of teacher slot assignments for multiple teachers
export const useSaveBatchTeacherSlotAssignments = (onSuccess?: () => void) => {
  return useMutationData(
    ['saveBatchTeacherSlotAssignments'],
    async (data: {
      assignments: Array<{
        teacher_id: number,
        slot_id: number,
        day_of_week: number,
        action: 'create' | 'update' | 'delete'
      }>
    }) => {
      try {
        const response = await api.post('/api/slots/batch-assignments/', data);
        return {
          status: response.status,
          data: response.data || { message: 'Batch assignments saved successfully' },
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            status: error.response.status,
            data: error.response.data || { error: 'Failed to save batch assignments' },
          };
        }
        throw error;
      }
    },
    ['teacher-slot-assignments'],
    onSuccess
  );
};

// Validate slot distribution against the 33% rule
export const validateSlotDistribution = (
  assignments: { slotId: number, teacherId: number }[],
  totalTeachers: number,
  departmentId?: number
): { isValid: boolean; message?: string } => {
  // Count teachers per slot
  const teachersPerSlot: Record<number, number> = {};

  // Initialize counts for all slots
  SLOT_TYPES.forEach(slot => {
    teachersPerSlot[slot.id] = 0;
  });

  // Count assignments
  assignments.forEach(assignment => {
    teachersPerSlot[assignment.slotId] = (teachersPerSlot[assignment.slotId] || 0) + 1;
  });

  // Calculate the target number per slot (33% of total)
  const targetPerSlot = Math.ceil(totalTeachers * 0.33);

  // Check if any slot exceeds the target
  for (const slotId in teachersPerSlot) {
    if (teachersPerSlot[slotId] > targetPerSlot) {
      const slotName = SLOT_TYPES.find(s => s.id === Number(slotId))?.name || `Slot ${slotId}`;
      return {
        isValid: false,
        message: `Slot ${slotName} has ${teachersPerSlot[slotId]} teachers assigned. Maximum allowed is ${targetPerSlot} (33% of total).`
      };
    }
  }

  return { isValid: true };
};

// Pre-defined slot types that match our backend
export const SLOT_TYPES = [
  {
    id: 1,
    type: 'A',
    name: 'Slot A',
    time: '8:00 AM - 3:00 PM'
  },
  {
    id: 2,
    type: 'B',
    name: 'Slot B',
    time: '10:00 AM - 5:00 PM'
  },
  {
    id: 3,
    type: 'C',
    name: 'Slot C',
    time: '12:00 PM - 7:00 PM'
  }
];

// Days of the week
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' }
]; 