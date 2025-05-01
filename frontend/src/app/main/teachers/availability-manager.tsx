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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Plus, Clock, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { 
  useGetTeacherAvailability, 
  useDeleteAvailability,
  Teacher as TeacherType,
  TeacherAvailability 
} from '@/action/teacher';
import AvailabilityForm from './availability-form';

interface AvailabilityManagerProps {
  teacher: TeacherType;
}

export default function AvailabilityManager({ teacher }: AvailabilityManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<TeacherAvailability | null>(null);
  
  const { 
    data: availabilitySlots, 
    isPending: isLoading, 
    refetch 
  } = useGetTeacherAvailability(teacher.id);
  
  const { mutate: deleteAvailability } = useDeleteAvailability(
    selectedAvailability?.id || 0,
    teacher.id,
    () => {
      refetch();
      toast.success('Availability slot deleted', {
        description: 'The availability slot has been removed.',
      });
      setIsDeleteDialogOpen(false);
      setSelectedAvailability(null);
    }
  );
  
  const handleAddClick = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleEditClick = (availability: TeacherAvailability) => {
    setSelectedAvailability(availability);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (availability: TeacherAvailability) => {
    setSelectedAvailability(availability);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedAvailability) {
      deleteAvailability({});
    }
  };
  
  const handleSuccess = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedAvailability(null);
    refetch();
  };
  
  // Sort availability slots by day and then by start time
  const sortedSlots = [...(availabilitySlots || [])].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) {
      return a.day_of_week - b.day_of_week;
    }
    return a.start_time.localeCompare(b.start_time);
  });
  
  const isLimitedAvailability = teacher.availability_type === 'limited';
  const isPOPOrIndustry = teacher.is_industry_professional || teacher.teacher_role === 'POP' || teacher.teacher_role === 'Industry Professional';
  
  return (
    <Card className="shadow-md mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Availability Schedule</CardTitle>
          </div>
          <CardDescription className="mt-1.5">
            {isPOPOrIndustry 
              ? 'Manage specific time slots when this industry professional/POP is available to teach'
              : 'Manage teaching availability for this teacher'}
          </CardDescription>
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleAddClick}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Slot
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !isLimitedAvailability ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border rounded-lg bg-muted/20">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Regular Availability</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              This teacher has regular availability (all working days). 
              {!isPOPOrIndustry && " Change to limited availability to manage specific time slots."}
            </p>
            {isPOPOrIndustry && (
              <Button 
                variant="secondary"
                size="sm"
                onClick={handleAddClick}
              >
                Add Availability Slot
              </Button>
            )}
          </div>
        ) : sortedSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border rounded-lg bg-muted/20">
            <Calendar className="h-12 w-12 text-muted-foreground/60 mb-3" />
            <h3 className="text-lg font-semibold mb-1">No Availability Slots</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {isPOPOrIndustry 
                ? 'This industry professional/POP has no availability slots defined yet.' 
                : 'No availability slots have been defined for this teacher.'}
            </p>
            <Button 
              variant="secondary"
              size="sm"
              onClick={handleAddClick}
            >
              Add First Slot
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {slot.day_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{slot.start_time} - {slot.end_time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(slot)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(slot)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
      
      {/* Add Availability Dialog */}
      {isAddDialogOpen && (
        <AvailabilityForm
          teacher={teacher}
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
      
      {/* Edit Availability Dialog */}
      {isEditDialogOpen && selectedAvailability && (
        <AvailabilityForm
          teacher={teacher}
          availability={selectedAvailability}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedAvailability(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Availability Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this availability slot?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setSelectedAvailability(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
} 