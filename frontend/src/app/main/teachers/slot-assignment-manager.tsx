import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Calendar, 
  Plus, 
  Clock, 
  AlarmClock, 
  Trash2, 
  CalendarDays, 
  Timer, 
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { 
  useGetTeacherSlotAssignments, 
  useCreateSlotAssignment,
  useDeleteSlotAssignment,
  useGetSlots,
  TeacherSlotAssignment,
  Slot
} from '@/action/slot';
import { Teacher as TeacherType } from '@/action/teacher';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Form schema for slot assignment
const slotAssignmentFormSchema = z.object({
  slot: z.coerce.number().positive('Please select a slot'),
  day_of_week: z.coerce.number().min(0).max(5, 'Please select a valid day')
});

type SlotAssignmentFormValues = z.infer<typeof slotAssignmentFormSchema>;

interface SlotAssignmentManagerProps {
  teacher: TeacherType;
}

export default function SlotAssignmentManager({ teacher }: SlotAssignmentManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherSlotAssignment | null>(null);
  
  const { 
    data: slotAssignments = [], 
    isPending: isAssignmentsLoading, 
    refetch: refetchAssignments
  } = useGetTeacherSlotAssignments(teacher.id);

  const {
    data: slots = [],
    isPending: isSlotsLoading
  } = useGetSlots();
  
  const { mutate: createSlotAssignment, isPending: isCreating } = useCreateSlotAssignment(
    teacher.id,
    () => {
      refetchAssignments();
      toast.success('Slot assignment added', {
        description: 'The slot assignment has been added successfully.',
      });
      setIsAddDialogOpen(false);
      form.reset();
    }
  );
  
  const { mutate: deleteSlotAssignment, isPending: isDeleting } = useDeleteSlotAssignment(
    selectedAssignment?.id || 0,
    teacher.id,
    () => {
      refetchAssignments();
      toast.success('Slot assignment deleted', {
        description: 'The slot assignment has been removed.',
      });
      setIsDeleteDialogOpen(false);
      setSelectedAssignment(null);
    }
  );

  // Setup form
  const form = useForm<SlotAssignmentFormValues>({
    resolver: zodResolver(slotAssignmentFormSchema),
    defaultValues: {
      slot: 0,
      day_of_week: 0,
    },
  });
  
  const handleAddClick = () => {
    form.reset({
      slot: 0,
      day_of_week: 0
    });
    setIsAddDialogOpen(true);
  };
  
  const handleDeleteClick = (assignment: TeacherSlotAssignment) => {
    setSelectedAssignment(assignment);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedAssignment) {
      deleteSlotAssignment({});
    }
  };

  const handleSubmit = (values: SlotAssignmentFormValues) => {
    createSlotAssignment({
      teacher: teacher.id,
      slot: values.slot,
      day_of_week: values.day_of_week
    });
  };
  
  // Sort slot assignments by day and then by slot start time
  const sortedAssignments = [...slotAssignments].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) {
      return a.day_of_week - b.day_of_week;
    }
    if (a.slot_detail && b.slot_detail) {
      return a.slot_detail.slot_start_time.localeCompare(b.slot_detail.slot_start_time);
    }
    return 0;
  });

  const getDayName = (dayIndex: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex] || '';
  };

  const getSlotById = (slotId: number) => {
    return slots.find(slot => slot.id === slotId);
  };
  
  return (
    <Card className="shadow-md mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <AlarmClock className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Teaching Slots</CardTitle>
          </div>
          <CardDescription className="mt-1.5">
            Manage fixed teaching slots for this teacher
          </CardDescription>
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleAddClick}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Slot Assignment
        </Button>
      </CardHeader>
      <CardContent>
        {isAssignmentsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : sortedAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border rounded-lg bg-muted/20">
            <Timer className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-lg font-semibold mb-1">No Slot Assignments</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              This teacher has no slot assignments defined yet.
            </p>
            <Button 
              variant="secondary"
              size="sm"
              onClick={handleAddClick}
            >
              Add First Slot Assignment
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-md border mb-4 bg-amber-50/50 p-3 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 flex items-start gap-2">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <strong>Note:</strong> Slot assignments follow the 2:2:1 ratio rule - a teacher can have the same slot assigned for a maximum of 2 days.
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAssignments.map((assignment) => {
                  const slotDetail = assignment.slot_detail || getSlotById(assignment.slot);
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {assignment.day_name || getDayName(assignment.day_of_week)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {slotDetail?.slot_name || `Slot ${assignment.slot}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                          <span>
                            {slotDetail ? `${slotDetail.slot_start_time} - ${slotDetail.slot_end_time}` : 'Time not available'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(assignment)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>

      {/* Add Slot Assignment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Slot Assignment</DialogTitle>
            <DialogDescription>
              Assign a specific slot to the teacher.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="slot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot</FormLabel>
                    <Select 
                      value={field.value ? field.value.toString() : "0"} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={isSlotsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {slots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id.toString()}>
                            {slot.slot_name} ({slot.slot_start_time} - {slot.slot_end_time})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="day_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select 
                      value={field.value !== undefined ? field.value.toString() : "0"} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Monday</SelectItem>
                        <SelectItem value="1">Tuesday</SelectItem>
                        <SelectItem value="2">Wednesday</SelectItem>
                        <SelectItem value="3">Thursday</SelectItem>
                        <SelectItem value="4">Friday</SelectItem>
                        <SelectItem value="5">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={isCreating || isSlotsLoading}
                >
                  {isCreating ? "Adding..." : "Add Slot Assignment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the slot assignment for {selectedAssignment?.day_name || getDayName(selectedAssignment?.day_of_week || 0)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
} 