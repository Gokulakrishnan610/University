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
  UniqueIdentifier,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useGetTeachers, Teacher as TeacherType } from '@/action/teacher';
import { 
  FIXED_SLOTS, 
  SlotOperation, 
  TeacherSlotAssignment, 
  useGetTeacherSlotAssignments,
  useSaveTeacherSlotAssignments
} from '@/action/slot';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, ChevronLeft, Save, AlertCircle, GripVertical, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

// Days of the week mapping
const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
];

// Interface for slot assignment state
interface SlotAssignment {
  teacherId: number;
  slotId: number;
}

// Draggable Teacher Component
const DraggableTeacher = ({ 
  teacher, 
  isAssigned = false 
}: { 
  teacher: TeacherType, 
  isAssigned?: boolean
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `teacher-${teacher.id}`,
    data: {
      type: 'teacher',
      teacher
    },
    disabled: isAssigned
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : undefined,
    boxShadow: isDragging ? '0 0 0 1px rgba(63, 63, 70, 0.05), 0 1px 3px 0 rgba(63, 63, 70, 0.15)' : undefined
  } : undefined;

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "";
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 mb-2 border rounded-md flex items-center justify-between shadow-sm transition-all
        ${isDragging ? 'bg-primary/5 border-primary/30' : ''}
        ${isAssigned 
          ? 'bg-muted/20 border-dashed opacity-60 cursor-not-allowed' 
          : 'bg-card hover:border-primary/30 hover:bg-primary/5 cursor-grab active:cursor-grabbing touch-manipulation'
        }`}
    >
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(teacher.teacher_id?.first_name, teacher.teacher_id?.last_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-sm">
            {teacher.teacher_id?.first_name} {teacher.teacher_id?.last_name}
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[180px]">
            {teacher.staff_code || 'No staff code'}
          </div>
        </div>
      </div>
      <GripVertical className={`h-5 w-5 ${isAssigned ? 'text-muted-foreground/30' : 'text-muted-foreground'}`} />
    </div>
  );
};

// Teacher Card for Drag Overlay
const TeacherCard = ({ teacher }: { teacher: TeacherType }) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "";
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div
      className="p-3 border rounded-md flex items-center justify-between shadow-md bg-card"
      style={{ width: '280px' }}
    >
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(teacher.teacher_id?.first_name, teacher.teacher_id?.last_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-sm">
            {teacher.teacher_id?.first_name} {teacher.teacher_id?.last_name}
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[180px]">
            {teacher.staff_code || 'No staff code'}
          </div>
        </div>
      </div>
      <GripVertical className="h-5 w-5 text-muted-foreground" />
    </div>
  );
};

// Slot Column Component - Update to support multiple teachers
const SlotColumn = ({ 
  slot, 
  assignedTeachers, 
  onRemove,
  maxTeachers
}: { 
  slot: typeof FIXED_SLOTS[number], 
  assignedTeachers: TeacherType[],
  onRemove: (teacherId: number) => void,
  maxTeachers: number
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slot.id}`,
    data: {
      type: 'slot',
      slot
    }
  });

  const isAtMaxCapacity = assignedTeachers.length >= maxTeachers;

  return (
    <div className="flex flex-col h-full" ref={setNodeRef}>
      <div className="bg-primary/10 p-2 rounded-t-md flex justify-between items-center border-b">
        <Badge variant="outline" className="text-primary font-medium text-sm">
          {slot.slot_name}
        </Badge>
        <div className="flex items-center gap-2">
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            {slot.slot_start_time.substring(0, 5)} - {slot.slot_end_time.substring(0, 5)}
          </div>
          {maxTeachers > 0 && (
            <Badge variant="secondary" className="text-xs">
              {assignedTeachers.length}/{maxTeachers}
            </Badge>
          )}
        </div>
      </div>
      
      <div 
        className={`flex-1 p-4 border-x border-b rounded-b-md flex flex-col items-center 
          ${isOver && !isAtMaxCapacity ? 'bg-primary/20 border-primary/40' : 
          assignedTeachers.length > 0 ? 'bg-primary/5' : 
          'bg-muted/10 border-dashed'} 
          ${isAtMaxCapacity ? 'cursor-not-allowed' : ''} 
          transition-colors duration-200 min-h-[180px]`}
      >
        {assignedTeachers.length > 0 ? (
          <div className="w-full flex flex-col items-center">
            <div className="grid grid-cols-1 gap-3 w-full">
              {assignedTeachers.map(teacher => (
                <div key={teacher.id} className="flex items-center justify-between p-2 bg-background rounded-md border">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {teacher.teacher_id?.first_name?.charAt(0) || ''}{teacher.teacher_id?.last_name?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {teacher.teacher_id?.first_name} {teacher.teacher_id?.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {teacher.staff_code}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7 px-2"
                    onClick={() => onRemove(teacher.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            
            {!isAtMaxCapacity && (
              <div className="w-full mt-2 flex justify-center">
                <p className="text-xs text-muted-foreground">
                  Drop another teacher here (max {maxTeachers})
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic text-center px-2 flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted mb-1">
                <Clock className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p>Drop teacher here</p>
              <p className="text-xs">(max {maxTeachers} teachers per slot)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SlotAllocationPage() {
  const navigate = useNavigate();
  const { data: teachersData, isPending: isLoadingTeachers } = useGetTeachers();
  const teachers = teachersData || [];
  
  const [currentDay, setCurrentDay] = useState(0); // Monday by default
  
  // Get assignments for the current day from the server
  const { 
    data: currentDayAssignmentsData, 
    isPending: isLoadingAssignments, 
    refetch: refetchCurrentDayAssignments 
  } = useGetTeacherSlotAssignments(currentDay);
  
  const [dayAssignments, setDayAssignments] = useState<Record<number, SlotAssignment[]>>({
    0: [], // Monday
    1: [], // Tuesday
    2: [], // Wednesday
    3: [], // Thursday
    4: [], // Friday
    5: [], // Saturday
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [nextDayChange, setNextDayChange] = useState<number | null>(null);
  
  // Calculate max teachers per slot (33% rule)
  const maxTeachersPerSlot = Math.ceil((teachers?.length || 0) / 3);
  
  // Save mutation for the current day
  const { mutate: saveAssignments } = useSaveTeacherSlotAssignments(() => {
    toast.success(`Assignments saved for ${DAYS_OF_WEEK.find(d => d.value === currentDay)?.label}`);
    setIsSaving(false);
    
    // If there was a pending day change, execute it
    if (nextDayChange !== null) {
      setCurrentDay(nextDayChange);
      setNextDayChange(null);
    }
    
    // Refetch assignments after saving
    refetchCurrentDayAssignments();
  });

  // Process current day assignments from the server
  useEffect(() => {
    if (currentDayAssignmentsData) {
      // Convert server data to our local format
      const currentAssignments = (currentDayAssignmentsData || []).map((assignment: TeacherSlotAssignment) => ({
        teacherId: assignment.teacher,
        slotId: assignment.slot
      }));
      
      // Update only the current day's assignments in our state
      setDayAssignments(prev => ({
        ...prev,
        [currentDay]: currentAssignments
      }));
    }
  }, [currentDayAssignmentsData, currentDay]);

  // Fetch data when day changes
  useEffect(() => {
    refetchCurrentDayAssignments();
  }, [currentDay, refetchCurrentDayAssignments]);

  // Set up DnD sensors for better touch and mouse support
  const sensors = useSensors(
    useSensor(MouseSensor, { 
      activationConstraint: { distance: 5 } 
    }),
    useSensor(TouchSensor, { 
      activationConstraint: { delay: 100, tolerance: 8 } 
    }),
    useSensor(KeyboardSensor, {})
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over) return;

    // Extract IDs from the drag operation
    const teacherId = parseInt(active.id.toString().replace('teacher-', ''));
    const slotId = parseInt(over.id.toString().replace('slot-', ''));

    // Process the assignment if valid
    assignTeacherToSlot(slotId, teacherId);
  };

  // Assign teacher to slot
  const assignTeacherToSlot = (slotId: number, teacherId: number) => {
    // Check if teacher is already assigned on this day
    const existingAssignment = dayAssignments[currentDay].find(a => a.teacherId === teacherId);
    if (existingAssignment) {
      toast.error('Teacher already assigned to a slot on this day', {
        description: 'A teacher can only be assigned to one slot per day'
      });
      return;
    }
    
    // Check if teacher is already assigned to the same slot on two other days
    const teacherAssignmentsToSameSlot = Object.entries(dayAssignments)
      .filter(([day]) => parseInt(day) !== currentDay) // Exclude current day
      .flatMap(([_, assignments]) => 
        assignments.filter(a => a.teacherId === teacherId && a.slotId === slotId)
      );
    
    if (teacherAssignmentsToSameSlot.length >= 2) {
      toast.error('Teacher already assigned to this same slot on 2 other days', {
        description: 'A teacher can have the same slot on a maximum of 2 different days'
      });
      return;
    }

    // Check if the slot already has the maximum allowed teachers (33% rule)
    const teachersInSlot = dayAssignments[currentDay].filter(a => a.slotId === slotId).length;
    if (teachersInSlot >= maxTeachersPerSlot) {
      toast.error(`Maximum teachers reached for ${getSlotName(slotId)}`, {
        description: `Maximum ${maxTeachersPerSlot} teachers allowed per slot (33% rule)`
      });
      return;
    }
    
    // Add the assignment (keep all existing assignments)
    const updatedAssignments = {
      ...dayAssignments,
      [currentDay]: [
        ...dayAssignments[currentDay].filter(a => !(a.teacherId === teacherId || (a.slotId === slotId && a.teacherId === teacherId))),
        { slotId, teacherId }
      ]
    };
    
    // Update state only (we'll save to server on explicit save)
    setDayAssignments(updatedAssignments);

    // Show success toast
    toast.success('Teacher assigned successfully', {
      description: `${getTeacherName(teacherId)} assigned to ${getSlotName(slotId)}`
    });
  };

  // Helper to get slot name
  const getSlotName = (slotId: number): string => {
    const slot = FIXED_SLOTS.find(s => s.id === slotId);
    return slot?.slot_name || `Slot ${slotId}`;
  };

  // Helper to get teacher name
  const getTeacherName = (teacherId: number): string => {
    const teacher = teachers.find((t: TeacherType) => t.id === teacherId);
    if (!teacher) return 'Teacher';
    return `${teacher.teacher_id?.first_name || ''} ${teacher.teacher_id?.last_name || ''}`;
  };

  // Remove teacher from slot
  const removeTeacherFromSlot = (slotId: number, teacherId: number) => {
    const teacher = teachers.find((t: TeacherType) => t.id === teacherId);
    const teacherName = teacher ? 
      `${teacher.teacher_id?.first_name || ''} ${teacher.teacher_id?.last_name || ''}` : 
      'Teacher';
    
    const updatedAssignments = {
      ...dayAssignments,
      [currentDay]: dayAssignments[currentDay].filter(a => !(a.slotId === slotId && a.teacherId === teacherId))
    };
    
    // Update state only (we'll save to server on explicit save)
    setDayAssignments(updatedAssignments);

    toast.success(`Removed ${teacherName} from ${getSlotName(slotId)}`);
  };

  // Get teachers assigned to a slot
  const getTeachersForSlot = (slotId: number): TeacherType[] => {
    const teacherIds = dayAssignments[currentDay]
      .filter(a => a.slotId === slotId)
      .map(a => a.teacherId);
    
    return teachers.filter((t: TeacherType) => teacherIds.includes(t.id));
  };

  // Check if a teacher is already assigned to any slot on the current day
  const isTeacherAssignedToday = (teacherId: number) => {
    return dayAssignments[currentDay].some(a => a.teacherId === teacherId);
  };

  // Handle day change
  const changeDay = (newDay: number) => {
    // Check if there are unsaved changes by comparing with server data
    const hasUnsavedChanges = currentDayAssignmentsData && dayAssignments[currentDay].length > 0 && 
      JSON.stringify(currentDayAssignmentsData.map((a: TeacherSlotAssignment) => ({
        teacherId: a.teacher,
        slotId: a.slot
      }))) !== JSON.stringify(dayAssignments[currentDay]);
    
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
      setNextDayChange(newDay);
    } else {
      setCurrentDay(newDay);
    }
  };

  // Save current day assignments
  const saveCurrentDayAssignments = () => {
    setIsSaving(true);
    
    // First delete all existing assignments for this day, then create new ones
    const operations: SlotOperation[] = [
      // First add all the assignments as 'create' operations
      ...dayAssignments[currentDay].map(assignment => ({
        action: 'create' as const,
        slot_id: assignment.slotId,
        day_of_week: currentDay
      }))
    ];
    
    // If there are no assignments, don't make an API call
    if (operations.length === 0) {
      toast.success('No assignments to save');
      setIsSaving(false);
      
      if (nextDayChange !== null) {
        setCurrentDay(nextDayChange);
        setNextDayChange(null);
      }
      return;
    }
    
    // Find a valid teacher ID for the API call
    let teacherId = dayAssignments[currentDay][0]?.teacherId;
    
    if (!teacherId && teachers.length > 0) {
      // If no specific teacher assigned, use the first available teacher
      teacherId = teachers[0].id;
    }
    
    if (!teacherId) {
      toast.error('No teacher found for assignment');
      setIsSaving(false);
      return;
    }
    
    // Save assignments for current day
    saveAssignments({
      teacher_id: teacherId,
      operations
    });
  };

  // Discard changes and change day
  const discardAndChangeDay = () => {
    if (nextDayChange !== null) {
      setCurrentDay(nextDayChange);
      setNextDayChange(null);
    }
    setShowConfirmDialog(false);
  };

  // Get active teacher
  const getActiveTeacher = () => {
    if (!activeId) return null;
    const teacherId = parseInt(activeId.toString().replace('teacher-', ''));
    return teachers.find((t: TeacherType) => t.id === teacherId);
  };

  const isLoading = isLoadingTeachers || isLoadingAssignments;

  // Create arrays of teacher IDs for the DnD context
  const teacherIds = teachers.map((teacher: TeacherType) => `teacher-${teacher.id}`);

  return (
    <div className="w-full mx-auto space-y-4 pb-6">
      <Card className="shadow-md border-t-4 border-t-primary overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <Button 
              variant="ghost" 
              className="mb-2 -ml-2" 
              onClick={() => navigate('/teachers')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Teachers
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Teacher Slot Allocation</CardTitle>
            </div>
            <CardDescription className="mt-1.5">
              Assign teachers to time slots for each day of the week
            </CardDescription>
          </div>
          <Button 
            onClick={saveCurrentDayAssignments} 
            disabled={isSaving || isLoading || dayAssignments[currentDay].length === 0}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Assignments'}
          </Button>
        </CardHeader>
        
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Skeleton className="h-52" />
                <Skeleton className="h-52" />
                <Skeleton className="h-52" />
                <Skeleton className="h-52" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {DAYS_OF_WEEK.map(day => (
                  <Button
                    key={day.value}
                    variant={currentDay === day.value ? "default" : "outline"}
                    className="mr-2 min-w-28"
                    onClick={() => changeDay(day.value)}
                    disabled={isSaving}
                  >
                    {day.label}
                    {dayAssignments[day.value].length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {dayAssignments[day.value].length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
              
              <div className="my-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-md w-full">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-500">Slot Assignment Rules</h4>
                    <ul className="mt-2 space-y-1 text-sm text-yellow-800 dark:text-yellow-400">
                      <li>• A teacher can only be assigned to one slot per day</li>
                      <li>• A teacher can have the same slot on a maximum of 2 different days</li>
                      <li>• Teachers cannot have overlapping time slots on the same day</li>
                      <li>• Maximum {maxTeachersPerSlot} teachers per slot (33% distribution rule)</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Teachers list */}
                  <div className="md:col-span-2">
                    <div className="bg-muted/20 p-4 rounded-md mb-4">
                      <h3 className="text-lg font-medium mb-2">Available Teachers for {DAYS_OF_WEEK.find(d => d.value === currentDay)?.label}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag teachers to assign them to slots
                      </p>
                      <p className="text-sm text-primary mb-4">
                        Maximum {maxTeachersPerSlot} teachers per slot (33% rule)
                      </p>
                      
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                        <SortableContext items={teacherIds} strategy={verticalListSortingStrategy}>
                          {teachers.map((teacher: TeacherType) => (
                            <DraggableTeacher 
                              key={teacher.id}
                              teacher={teacher} 
                              isAssigned={isTeacherAssignedToday(teacher.id)}
                            />
                          ))}
                        </SortableContext>
                      </div>
                    </div>
                  </div>
                  
                  {/* Slot columns */}
                  <div className="md:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                      {FIXED_SLOTS.map(slot => (
                        <SlotColumn
                          key={slot.id}
                          slot={slot}
                          assignedTeachers={getTeachersForSlot(slot.id)}
                          onRemove={(teacherId) => removeTeacherFromSlot(slot.id, teacherId)}
                          maxTeachers={maxTeachersPerSlot}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <DragOverlay>
                  {activeId && getActiveTeacher() && (
                    <TeacherCard teacher={getActiveTeacher() as TeacherType} />
                  )}
                </DragOverlay>
              </DndContext>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog for changing day with unsaved changes */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved slot assignments for {DAYS_OF_WEEK.find(d => d.value === currentDay)?.label}.
              Do you want to save before changing days?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNextDayChange(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={saveCurrentDayAssignments}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save & Continue'}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={discardAndChangeDay}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Discard & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 