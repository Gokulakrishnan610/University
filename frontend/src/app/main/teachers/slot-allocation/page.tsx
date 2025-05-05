import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  UniqueIdentifier
} from '@dnd-kit/core';
import { useGetTeachers, Teacher as TeacherType } from '@/action/teacher';
import {
  SLOT_TYPES,
  DAYS_OF_WEEK,
  SlotOperation,
  TeacherSlotAssignment,
  useGetTeacherSlotAssignments,
  useSaveTeacherSlotAssignments,
  useSaveBatchTeacherSlotAssignments,
  useGetDepartmentSummary,
  useInitializeDefaultSlots,
  validateSlotDistribution
} from '@/action/slot';
import { useGetCurrentDepartment } from '@/action/department';
import { useCurrentUser } from '@/action/authentication';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ChevronLeft, Save, AlertCircle, GripVertical, Clock, Info, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import the components we created
import {
  DraggableTeacher,
  SlotColumn,
  TeacherCard,
  UnsavedChangesDialog,
  DepartmentSummaryCard
} from './components';

// Interface for slot assignment state
interface SlotAssignment {
  teacherId: number;
  slotId: number;
}

interface ErrorDetail {
  action: string;
  teacher_id: number;
  slot_id: number;
  day_of_week: number;
  error: string;
}

// Custom hook for batch assignments with error handling
const useEnhancedBatchAssignments = () => {
  const [errorDetails, setErrorDetails] = useState<ErrorDetail[]>([]);
  const { mutate, isPending: isSaving } = useSaveBatchTeacherSlotAssignments();

  const saveBatchAssignments = async (data: {
    assignments: Array<{
      teacher_id: number;
      slot_id: number;
      day_of_week: number;
      action: 'create' | 'update' | 'delete';
    }>;
  }) => {
    // Clear previous errors
    setErrorDetails([]);

    // Show in-progress toast
    const toastId = toast.loading('Saving assignments...');

    return new Promise<void>((resolve) => {
      mutate(data, {
        onSuccess: (response) => {
          if (response && response.data) {
            const { success_count, total_operations, results } = response.data;

            // Clear the loading toast
            toast.dismiss(toastId);

            if (success_count === total_operations) {
              // All operations succeeded
              toast.success(`Successfully saved all ${success_count} assignments`);
            } else {
              // Some operations failed
              toast.error(`Saved ${success_count} of ${total_operations} assignments. Check errors for details.`);

              // Collect error details
              const failedOperations = results
                .filter((result: any) => !result.success && result.error)
                .map((result: any) => ({
                  action: result.action,
                  teacher_id: result.teacher_id,
                  slot_id: result.slot_id,
                  day_of_week: result.day_of_week,
                  error: result.error
                }));

              if (failedOperations.length > 0) {
                setErrorDetails(failedOperations);
              }
            }
          }
          resolve();
        },
        onError: (error) => {
          // Clear the loading toast
          toast.dismiss(toastId);
          console.error('Error saving assignments:', error);
          toast.error('Failed to save assignments');
          resolve();
        }
      });
    });
  };

  return {
    saveBatchAssignments,
    isSaving,
    errorDetails,
    clearErrors: () => setErrorDetails([])
  };
};

// Error display component for batch operations
const ErrorResponseDisplay = ({
  errors,
  onClose,
  teachers
}: {
  errors: ErrorDetail[],
  onClose: () => void,
  teachers?: TeacherType[]
}) => {
  const getTeacherName = (teacherId: number): string => {
    const teacher = teachers?.find((t: TeacherType) => t.id === teacherId);
    if (!teacher) return `Teacher ${teacherId}`;
    return `${teacher.teacher_id?.first_name} ${teacher.teacher_id?.last_name}`;
  };

  const getSlotName = (slotId: number): string => {
    const slot = SLOT_TYPES.find(s => s.id === slotId);
    return slot ? slot.name : `Slot ${slotId}`;
  };

  const getDayName = (dayIndex: number): string => {
    return DAYS_OF_WEEK.find(d => d.value === dayIndex)?.label || `Day ${dayIndex}`;
  };

  return (
    <Dialog open={errors.length > 0} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Saving Assignments
          </DialogTitle>
          <DialogDescription>
            The following errors occurred while saving assignments:
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[300px] overflow-y-auto">
          <div className="space-y-3">
            {errors.map((error, index) => (
              <div key={index} className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-sm text-destructive">
                    {error.action === 'create' ? 'Create' :
                      error.action === 'update' ? 'Update' :
                        error.action === 'delete' ? 'Delete' : 'Unknown'} Error
                  </div>
                  <Badge variant="outline" className="text-[10px]">{getDayName(error.day_of_week)}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  <div className="font-medium">
                    {getTeacherName(error.teacher_id)} / {getSlotName(error.slot_id)}
                  </div>
                  <div className="mt-1 text-destructive">
                    {error.error}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onClose()}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function SlotAllocationPage() {
  const navigate = useNavigate();

  // Get current user information
  const { data: currentUserData } = useCurrentUser();
  const currentUser = currentUserData?.teacher || null;

  // Get current department information
  const { data: currentDepartment } = useGetCurrentDepartment();

  // Check if user is HOD
  const isHOD = currentUser?.teacher_role === 'HOD';
  const hodDeptId = isHOD && currentDepartment?.id ? currentDepartment.id : null;

  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [activeTeacherId, setActiveTeacherId] = useState<UniqueIdentifier | null>(null);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState<boolean>(false);
  const [targetDayIndex, setTargetDayIndex] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

  // Use our enhanced batch assignments hook
  const {
    saveBatchAssignments,
    isSaving,
    errorDetails,
    clearErrors
  } = useEnhancedBatchAssignments();

  // Track assignments by day for each slot
  const [slotAssignments, setSlotAssignments] = useState<Record<number, SlotAssignment[]>>({});

  // Track teachers who have assignments across all days
  const [teacherAssignmentCounts, setTeacherAssignmentCounts] = useState<Record<number, number>>({});

  // Track changes that need to be saved
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Store original assignments for comparison
  const [originalAssignments, setOriginalAssignments] = useState<Record<number, SlotAssignment[]>>({});

  // Keep track of which days have been fetched already
  const [fetchedDays, setFetchedDays] = useState<number[]>([]);

  // If user is HOD, set their department as the selected department
  useEffect(() => {
    if (isHOD && hodDeptId && !selectedDepartmentId) {
      setSelectedDepartmentId(hodDeptId);
    }
  }, [isHOD, hodDeptId, selectedDepartmentId]);

  // API queries
  const { data: teachers, isPending: isLoadingTeachers } = useGetTeachers();


  // Use the teacherSlots API
  const { data: teacherSlotsData, isPending: isLoadingAssignments, refetch: refetchAssignments } =
    useGetTeacherSlotAssignments({
      day_of_week: currentDayIndex,
      dept_id: selectedDepartmentId || undefined,
      include_stats: true
    });

  // Get department summary if a department is selected
  const { data: departmentSummary, refetch: refetchDepartmentSummary } = useGetDepartmentSummary(selectedDepartmentId || 0);

  // Initialize default slots if needed
  const { mutate: initializeSlots } = useInitializeDefaultSlots();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before activation
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay for touch
        tolerance: 5, // 5px of movement allowed during delay
      },
    })
  );

  // Initialize slots when component mounts
  useEffect(() => {
    initializeSlots({});
  }, []);

  // Load assignments for the current day
  useEffect(() => {
    if (teacherSlotsData && !fetchedDays.includes(currentDayIndex)) {
      // Process fetched assignments
      const dayAssignments: SlotAssignment[] = [];

      teacherSlotsData.assignments.forEach((assignment: TeacherSlotAssignment) => {
        dayAssignments.push({
          teacherId: assignment.teacher,
          slotId: assignment.slot.id
        });
      });

      // Update slot assignments
      setSlotAssignments(prev => ({
        ...prev,
        [currentDayIndex]: dayAssignments
      }));

      // Update original assignments for detecting changes
      setOriginalAssignments(prev => ({
        ...prev,
        [currentDayIndex]: [...dayAssignments]
      }));

      // Add this day to the list of fetched days
      setFetchedDays(prev => [...prev, currentDayIndex]);
    }
  }, [teacherSlotsData, currentDayIndex, fetchedDays]);

  // Update teacher assignment counts across all days
  useEffect(() => {
    const counts: Record<number, number> = {};

    // Count assignments per teacher across all days
    Object.values(slotAssignments).forEach(dayAssignments => {
      dayAssignments.forEach(assignment => {
        counts[assignment.teacherId] = (counts[assignment.teacherId] || 0) + 1;
      });
    });

    setTeacherAssignmentCounts(counts);

    // If there are changes, trigger department summary refresh
    if (hasUnsavedChanges && selectedDepartmentId) {
      // This will update the UI correctly, even if data isn't saved to backend yet
      updateLocalDepartmentSummary();
    }
  }, [slotAssignments]);

  // Local update for department summary before saving to backend
  const updateLocalDepartmentSummary = () => {
    if (!departmentSummary || !teachers) return;

    // Create a copy of the existing department summary
    const updatedSummary = structuredClone(departmentSummary);

    // Track which teachers are assigned to which days/slots in our local data
    const teacherDayMap: Record<number, Set<number>> = {}; // teacherId -> set of days
    const teacherSlotMap: Record<number, Set<string>> = {}; // teacherId -> set of slot types
    const daysTeacherMap: Record<number, Set<number>> = {}; // dayIndex -> set of teachers
    const slotTeacherMap: Record<string, Set<number>> = {}; // slotType -> set of teachers

    // Initialize maps
    (teachers || []).forEach((t: TeacherType) => {
      teacherDayMap[t.id] = new Set();
      teacherSlotMap[t.id] = new Set();
    });

    DAYS_OF_WEEK.forEach(day => {
      daysTeacherMap[day.value] = new Set();
    });

    SLOT_TYPES.forEach(slot => {
      slotTeacherMap[slot.type] = new Set();
    });

    // Fill maps from current assignments
    Object.entries(slotAssignments).forEach(([dayIndexStr, assignments]) => {
      const dayIndex = parseInt(dayIndexStr);

      assignments.forEach(assignment => {
        const teacherId = assignment.teacherId;
        const slot = SLOT_TYPES.find(s => s.id === assignment.slotId);

        if (slot && teacherId) {
          // Add day to teacher's days
          teacherDayMap[teacherId]?.add(dayIndex);

          // Add teacher to day's teachers
          daysTeacherMap[dayIndex]?.add(teacherId);

          // Add slot type to teacher's slot types
          teacherSlotMap[teacherId]?.add(slot.type);

          // Add teacher to slot type's teachers
          slotTeacherMap[slot.type]?.add(teacherId);
        }
      });
    });

    // Update days assigned distribution
    for (let i = 1; i <= 5; i++) {
      const daysKey = `${i} day${i > 1 ? 's' : ''}`;
      // Count teachers who have exactly i days assigned
      updatedSummary.days_assigned_distribution[daysKey] =
        Object.values(teacherDayMap)
          .filter(days => days.size === i)
          .length;
    }

    // Update slot type summary
    Object.entries(slotTeacherMap).forEach(([slotType, teacherIds]) => {
      if (updatedSummary.slot_type_summary[slotType]) {
        updatedSummary.slot_type_summary[slotType].teacher_count = teacherIds.size;
        updatedSummary.slot_type_summary[slotType].percentage =
          Math.round((teacherIds.size / departmentSummary.total_teachers) * 100);
      }
    });
  };

  // Refresh department summary when slot assignments change
  useEffect(() => {
    if (hasUnsavedChanges === false && selectedDepartmentId) {
      refetchDepartmentSummary();
    }
  }, [hasUnsavedChanges, selectedDepartmentId, refetchDepartmentSummary]);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'teacher') {
      setActiveTeacherId(event.active.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTeacherId(null);

    const { active, over } = event;

    if (!over) return;

    // Get the data from the drag event
    const teacherData = active.data.current as { type: string; teacher: TeacherType };
    const overData = over.data.current as { type: string; slot: typeof SLOT_TYPES[number] };

    // Make sure we're dragging a teacher over a slot
    if (teacherData?.type === 'teacher' && overData?.type === 'slot') {
      const teacherId = teacherData.teacher.id;
      const slotId = overData.slot.id;

      assignTeacherToSlot(slotId, teacherId);
    }
  };

  const assignTeacherToSlot = (slotId: number, teacherId: number) => {
    // Check if the teacher is already at max days (5)
    if ((teacherAssignmentCounts[teacherId] || 0) >= 5 &&
      !isTeacherAssignedToDay(teacherId, currentDayIndex)) {
      toast.error('This teacher is already assigned for 5 days, which is the maximum allowed.');
      return;
    }

    // Check if the teacher is already assigned to another slot on this day
    const existingAssignment = (slotAssignments[currentDayIndex] || []).find(
      a => a.teacherId === teacherId
    );

    if (existingAssignment) {
      toast.error('This teacher is already assigned to a slot on this day.');
      return;
    }

    // Check department distribution constraint (33%)
    const teacher = teachers?.find((t: TeacherType) => t.id === teacherId);

    if (teacher?.dept_id) {
      const deptId = teacher.dept_id.id;
      const deptTeachers = teachers?.filter((t: TeacherType) => t.dept_id?.id === deptId) || [];
      const deptTeacherCount = deptTeachers.length;

      // Calculate current dept teachers in this slot
      const deptTeachersInSlot = (slotAssignments[currentDayIndex] || [])
        .filter(a => {
          const t = teachers?.find((t: TeacherType) => t.id === a.teacherId);
          return t?.dept_id?.id === deptId && a.slotId === slotId;
        }).length;

      // 33% threshold (rounded up)
      const maxAllowed = Math.ceil(deptTeacherCount * 0.33);

      if (deptTeachersInSlot >= maxAllowed) {
        toast.error(
          `Cannot assign more than 33% of department teachers (${maxAllowed}) to the same slot type.`
        );
        return;
      }
    }

    // Add the new assignment
    const newAssignments = [...(slotAssignments[currentDayIndex] || []), { teacherId, slotId }];

    setSlotAssignments(prev => ({
      ...prev,
      [currentDayIndex]: newAssignments
    }));

    setHasUnsavedChanges(true);

    // Update teacher day counts immediately
    updateTeacherAssignmentCounts();

    // Optional: Show success message
    const teacherName = getTeacherName(teacherId);
    const slotName = getSlotName(slotId);
    toast.success(`Assigned ${teacherName} to ${slotName}`);
  };

  const getSlotName = (slotId: number): string => {
    const slot = SLOT_TYPES.find(s => s.id === slotId);
    return slot ? slot.name : `Slot ${slotId}`;
  };

  const getTeacherName = (teacherId: number): string => {
    const teacher = teachers?.find((t: TeacherType) => t.id === teacherId);
    if (!teacher) return `Teacher ${teacherId}`;
    return `${teacher.teacher_id?.first_name} ${teacher.teacher_id?.last_name}`;
  };

  const getTeacherDeptId = (teacherId: number): number | null => {
    const teacher = teachers?.find((t: TeacherType) => t.id === teacherId);
    return teacher?.dept_id?.id || null;
  };

  const removeTeacherFromSlot = (teacherId: number) => {
    const currentDayAssignments = slotAssignments[currentDayIndex] || [];
    const updatedAssignments = currentDayAssignments.filter(
      assignment => assignment.teacherId !== teacherId
    );

    setSlotAssignments(prev => ({
      ...prev,
      [currentDayIndex]: updatedAssignments
    }));

    setHasUnsavedChanges(true);

    // Update teacher day counts immediately after removal
    updateTeacherAssignmentCounts();

    // Optional: Show success message
    const teacherName = getTeacherName(teacherId);
    toast.success(`Removed ${teacherName} from slot assignment`);
  };

  const getTeachersForSlot = (slotId: number): TeacherType[] => {
    const currentDayAssignments = slotAssignments[currentDayIndex] || [];
    const teacherIds = currentDayAssignments
      .filter(assignment => assignment.slotId === slotId)
      .map(assignment => assignment.teacherId);

    return (teachers || []).filter((teacher: TeacherType) => teacherIds.includes(teacher.id));
  };

  const isTeacherAssignedToDay = (teacherId: number, dayIndex: number): boolean => {
    const dayAssignments = slotAssignments[dayIndex] || [];
    return dayAssignments.some(a => a.teacherId === teacherId);
  };

  const changeDay = (newDay: number) => {
    if (hasUnsavedChanges) {
      setTargetDayIndex(newDay);
      setShowUnsavedChangesDialog(true);
      return;
    }

    setCurrentDayIndex(newDay);
  };

  const saveCurrentDayAssignments = async () => {
    // Identify all changes from the current day
    const batchAssignments: Array<{
      teacher_id: number;
      slot_id: number;
      day_of_week: number;
      action: 'create' | 'update' | 'delete';
    }> = [];

    // Process assignments for the current day
    const currentDayAssignments = slotAssignments[currentDayIndex] || [];

    currentDayAssignments.forEach(assignment => {
      const teacherId = assignment.teacherId;
      const slotId = assignment.slotId;

      // Check if it's a new assignment or a change
      const originalAssignment = originalAssignments[currentDayIndex]?.find(
        a => a.teacherId === teacherId
      );

      if (originalAssignment) {
        // It's an existing assignment
        if (originalAssignment.slotId !== slotId) {
          // It's a slot change
          batchAssignments.push({
            teacher_id: teacherId,
            slot_id: slotId,
            day_of_week: currentDayIndex,
            action: 'update'
          });
        }
        // No change, skip
      } else {
        // It's a new assignment
        batchAssignments.push({
          teacher_id: teacherId,
          slot_id: slotId,
          day_of_week: currentDayIndex,
          action: 'create'
        });
      }
    });

    // Process deletions - find assignments in original that aren't in current state
    for (const assignment of originalAssignments[currentDayIndex] || []) {
      const teacherId = assignment.teacherId;
      const exists = currentDayAssignments.some(a => a.teacherId === teacherId);

      // If teacher doesn't have an assignment for this day anymore, it's deleted
      if (!exists) {
        batchAssignments.push({
          teacher_id: teacherId,
          slot_id: assignment.slotId,
          day_of_week: currentDayIndex,
          action: 'delete'
        });
      }
    }

    // Return early if no changes
    if (batchAssignments.length === 0) {
      setHasUnsavedChanges(false);
      toast.success('No changes to save');
      return;
    }

    try {
      // Show saving toast
      const toastId = toast.loading('Saving assignments...');

      // Save batch assignments and wait for completion
      await saveBatchAssignments({ assignments: batchAssignments });

      // Update saved state
      setHasUnsavedChanges(false);

      // Update original assignments to match current state
      setOriginalAssignments(prev => ({
        ...prev,
        [currentDayIndex]: [...currentDayAssignments]
      }));

      // Refresh data from backend
      await refetchAssignments();

      // Refresh department summary for accurate stats
      if (selectedDepartmentId) {
        await refetchDepartmentSummary();
      }

      // Update teacher assignment counts immediately
      updateTeacherAssignmentCounts();

      // Clear loading toast and show success
      toast.dismiss(toastId);
      toast.success('Assignments saved successfully');
    } catch (error) {
      console.error('Error in saveCurrentDayAssignments:', error);
      toast.error('Error saving assignments');
    }
  };

  // Update teacher assignment counts from slot assignments
  const updateTeacherAssignmentCounts = () => {
    const teacherDayMap: Record<number, Set<number>> = {};

    // Initialize map
    if (teachers) {
      teachers.forEach((teacher: TeacherType) => {
        teacherDayMap[teacher.id] = new Set();
      });
    }

    // Fill map from assignments
    Object.entries(slotAssignments).forEach(([dayIndexStr, assignments]) => {
      const dayIndex = parseInt(dayIndexStr);

      assignments.forEach(assignment => {
        if (!teacherDayMap[assignment.teacherId]) {
          teacherDayMap[assignment.teacherId] = new Set();
        }
        teacherDayMap[assignment.teacherId].add(dayIndex);
      });
    });

    // Convert to counts
    const counts: Record<number, number> = {};
    Object.entries(teacherDayMap).forEach(([teacherId, days]) => {
      counts[parseInt(teacherId)] = days.size;
    });

    // Update state
    setTeacherAssignmentCounts(counts);
  };

  const discardAndChangeDay = () => {
    setShowUnsavedChangesDialog(false);

    // Revert changes for the current day
    if (originalAssignments[currentDayIndex]) {
      setSlotAssignments(prev => ({
        ...prev,
        [currentDayIndex]: [...originalAssignments[currentDayIndex]]
      }));
    }

    setHasUnsavedChanges(false);

    // Change to the target day
    if (targetDayIndex !== null) {
      setCurrentDayIndex(targetDayIndex);
      setTargetDayIndex(null);
    }
  };

  const getActiveTeacher = () => {
    if (!activeTeacherId) return null;

    const id = activeTeacherId.toString().replace('teacher-', '');
    return teachers?.find((t: TeacherType) => t.id.toString() === id);
  };

  const getDepartmentTeacherCount = (deptId: number): number => {
    return (teachers || []).filter((t: TeacherType) => t.dept_id?.id === deptId).length;
  };

  const getDepartmentTeachersInSlot = (slotId: number, deptId: number): number => {
    const currentDayAssignments = slotAssignments[currentDayIndex] || [];
    return currentDayAssignments
      .filter(a => a.slotId === slotId)
      .filter(a => getTeacherDeptId(a.teacherId) === deptId)
      .length;
  };

  const getDepartmentCounts = (slotId: number): Record<number, number> => {
    const result: Record<number, number> = {};
    const currentDayAssignments = slotAssignments[currentDayIndex] || [];

    currentDayAssignments
      .filter(a => a.slotId === slotId)
      .forEach(a => {
        const deptId = getTeacherDeptId(a.teacherId);
        if (deptId) {
          result[deptId] = (result[deptId] || 0) + 1;
        }
      });

    return result;
  };

  // Calculate maximum number of teachers allowed per slot
  const getMaxTeachersAllowed = (slotId: number): number => {
    if (!selectedDepartmentId) return 999;

    const deptTeacherCount = getDepartmentTeacherCount(selectedDepartmentId);
    // 33% threshold (rounded up)
    return Math.ceil(deptTeacherCount * 0.33);
  };

  // Handle save before navigating away
  const handleSaveAndClose = async () => {
    if (hasUnsavedChanges) {
      await saveCurrentDayAssignments();
    }
    setTimeout(() => {
      navigate('/main/teachers');
    }, 500);
  };

  return (
    <main className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold ml-4">Faculty Slot Allocation</h1>

          {isHOD && hodDeptId && (
            <Badge variant="outline" className="ml-2 text-xs">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Restricted to your department
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>As a HOD, you can only manage teachers from your department.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Badge>
          )}
        </div>

        <div className="flex gap-4">
          <Select
            value={selectedDepartmentId?.toString() || "all"}
            onValueChange={(value) => setSelectedDepartmentId(value === "all" ? null : parseInt(value))}
            disabled={isHOD} // Disable selection for HODs as they can only manage their department
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              {!isHOD && <SelectItem value="all">All Departments</SelectItem>}
              {/* Filter departments based on HOD status */}
              {(teachers || [])
                .filter((t: TeacherType) => t.dept_id)
                .map((t: TeacherType) => t.dept_id)
                .filter((dept: any, index: number, self: any[]) => {
                  // For HODs, only show their department
                  if (isHOD && hodDeptId) {
                    return dept && dept.id === hodDeptId;
                  }
                  // For non-HODs, show all unique departments
                  return dept && self.findIndex((d: any) => d?.id === dept?.id) === index;
                })
                .map((dept: any, index: number) => (
                  <SelectItem key={dept?.id} value={dept?.id?.toString() || `dept-${index}`}>
                    {dept?.dept_name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button
            onClick={saveCurrentDayAssignments}
            disabled={!hasUnsavedChanges || isSaving}
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Day selection tabs */}
      <div className="flex mb-6 border-b">
        {DAYS_OF_WEEK.map((day) => (
          <button
            key={day.value}
            className={`px-4 py-2 ${currentDayIndex === day.value
              ? 'border-b-2 border-primary font-medium text-primary'
              : 'text-muted-foreground hover:text-foreground'
              }`}
            onClick={() => changeDay(day.value)}
          >
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {day.label}
            </div>
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-6">
          {/* Teacher list */}
          <div className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teachers</CardTitle>
                <CardDescription>
                  Drag and drop teachers to assign them to slots
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isLoadingTeachers ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto">
                    {/* Filter out teachers already assigned on this day */}
                    {(teachers || [])
                      .filter((teacher: TeacherType) => {
                        // If department filter is applied, only show teachers from that department
                        if (selectedDepartmentId) {
                          return teacher.dept_id?.id === selectedDepartmentId;
                        }
                        return true;
                      })
                      .map((teacher: TeacherType) => (
                        <DraggableTeacher
                          key={teacher.id}
                          teacher={teacher}
                          isAssigned={isTeacherAssignedToDay(teacher.id, currentDayIndex)}
                          assignedDays={teacherAssignmentCounts[teacher.id] || 0}
                          departmentSummary={departmentSummary}
                          isHOD={isHOD}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedDepartmentId && departmentSummary && (
              <DepartmentSummaryCard departmentSummary={departmentSummary} isHOD={isHOD} />
            )}
          </div>

          {/* Slot columns */}
          <div className="col-span-3 grid grid-cols-3 gap-4">
            {SLOT_TYPES.map((slot) => (
              <SlotColumn
                key={slot.id}
                slot={slot}
                assignedTeachers={getTeachersForSlot(slot.id)}
                onRemove={removeTeacherFromSlot}
                maxTeachers={getMaxTeachersAllowed(slot.id)}
                departmentCounts={getDepartmentCounts(slot.id)}
                deptInfo={selectedDepartmentId ? {
                  id: selectedDepartmentId,
                  name: teachers?.find((t: TeacherType) => t.dept_id?.id === selectedDepartmentId)?.dept_id?.dept_name || 'Department',
                  teacherCount: getDepartmentTeacherCount(selectedDepartmentId)
                } : null}
              />
            ))}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeTeacherId ? (
            <TeacherCard teacher={getActiveTeacher()!} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Unsaved changes dialog */}
      <UnsavedChangesDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
        onDiscard={discardAndChangeDay}
        onSave={async () => {
          await saveCurrentDayAssignments();
          setShowUnsavedChangesDialog(false);
          if (targetDayIndex !== null) {
            setCurrentDayIndex(targetDayIndex);
            setTargetDayIndex(null);
          }
        }}
      />

      {/* Error Dialog */}
      <ErrorResponseDisplay
        errors={errorDetails}
        onClose={clearErrors}
        teachers={teachers}
      />
    </main>
  );
} 