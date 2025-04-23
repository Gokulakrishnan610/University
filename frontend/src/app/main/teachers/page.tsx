import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGetTeachers, useUpdateTeacher, Teacher } from '@/action/teacher';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Pencil, Eye, Users, Building, UserMinus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import TeacherForm from './form';

export default function TeacherManagement() {
  const navigate = useNavigate();
  const { data: teachersData, isPending: isLoading, refetch } = useGetTeachers();

  const teachers = teachersData || [];
  const [teacherToRemove, setTeacherToRemove] = useState<Teacher | null>(null);

  const { mutate: updateTeacher } = useUpdateTeacher(
    teacherToRemove?.id || 0,
    () => {
      refetch();
      setTeacherToRemove(null);
    }
  );

  const handleRemoveFromDepartment = () => {
    if (!teacherToRemove) return;

    console.log('Removing teacher from department:', teacherToRemove.id);
    updateTeacher(
      { dept: null },
      {
        onSuccess: () => {
          toast.success('Teacher removed from department', {
            description: 'Teacher has been removed from the department successfully.',
          });
          refetch();
          setTeacherToRemove(null);
        },
        onError: (error: Error) => {
          console.error('Error removing from department:', error);
          toast.error('Error', {
            description: `Failed to remove teacher: ${error.message}`,
          });
          setTeacherToRemove(null);
        },
      }
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="py-10 w-full mx-auto">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Teacher Management</CardTitle>
            </div>
            <CardDescription className="mt-1.5">
              Manage teachers in your department
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/20">
              <Users className="h-16 w-16 text-muted-foreground/60 mb-4" />
              <p className="text-muted-foreground text-lg mb-4">
                No teachers found in your department
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[300px]">Teacher</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher: Teacher) => (
                    <TableRow
                      key={teacher.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/teachers/${teacher.id}`)}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9 border border-primary/30">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(teacher.teacher.first_name, teacher.teacher.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {teacher.teacher.first_name} {teacher.teacher.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {teacher.staff_code || 'No Staff Code'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                          {teacher.teacher_role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {teacher.dept?.dept_name ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Building className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{teacher.dept.dept_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {teacher.teacher_specialisation || (
                          <span className="text-muted-foreground text-sm italic">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[240px]">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/teachers/${teacher.id}`);
                            }}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/teachers/${teacher.id}?edit=true`);
                            }}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Teacher
                            </DropdownMenuItem>
                            {teacher.dept && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTeacherToRemove(teacher);
                                }}
                              >
                                <UserMinus className="mr-2 h-4 w-4" /> Remove from Department
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!teacherToRemove} onOpenChange={(open) => !open && setTeacherToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold">
                {teacherToRemove?.teacher.first_name} {teacherToRemove?.teacher.last_name}
              </span> from {teacherToRemove?.dept?.dept_name}?
              <br /><br />
              This action will only remove the teacher's department association, not delete the teacher profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFromDepartment}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 