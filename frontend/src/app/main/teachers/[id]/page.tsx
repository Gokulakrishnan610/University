import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import {
  useGetTeacher,
  useUpdateTeacher,
  Teacher
} from '@/action/teacher';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { ChevronLeft, Pencil, Mail, Building, Clock, BookOpen, User, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import TeacherForm from '../form';

export default function TeacherDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isEditMode = queryParams.get('edit') === 'true';
  const [showEditForm, setShowEditForm] = useState(isEditMode);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const teacherId = parseInt(id as string);

  const { data: teacher, isPending: isLoading, refetch } = useGetTeacher(teacherId);
  const { mutate: updateTeacher, isPending: isUpdating } = useUpdateTeacher(teacherId, () => {
    toast.success("Teacher updated successfully");
    refetch();
    setShowEditForm(false);
  });

  // Clean up URL if edit parameter exists
  useEffect(() => {
    if (isEditMode) {
      const cleanUrl = location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [isEditMode, location.pathname]);

  if (isLoading || !teacher) {
    return (
      <div className="py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/teachers')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Teachers
          </Button>
        </div>
        <Card className="shadow-md">
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const department = teacher.dept;
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const fullName = `${teacher.teacher.first_name} ${teacher.teacher.last_name}`;

  const handleRemoveFromDepartment = () => {
    console.log('Removing teacher from department...');
    updateTeacher({
      dept: null
    }, {
      onSuccess: () => {
        toast.success("Teacher removed from department", {
          description: "The teacher has been successfully removed from the department."
        });
        navigate('/teachers');
      },
      onError: (error) => {
        console.error('Error removing from department:', error);
        toast.error("Failed to remove teacher", {
          description: error.message || "An error occurred while removing the teacher from the department."
        });
      }
    });
    setShowRemoveDialog(false);
  };

  return (
    <div className="w-full mx-auto">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {fullName}
                <Badge className="ml-3 bg-primary/20 text-primary hover:bg-primary/30">
                  {teacher.teacher_role}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <span className="font-medium text-muted-foreground">{teacher.staff_code || 'No Staff Code'}</span>
                {department && (
                  <span className="flex items-center ml-4 text-sm text-muted-foreground">
                    <Building className="h-3.5 w-3.5 mr-1" /> {department.dept_name}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {department && (
              <Button variant="outline" onClick={() => setShowRemoveDialog(true)} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <UserMinus className="mr-2 h-4 w-4" /> Remove from Department
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowEditForm(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Contact Information
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground mr-2">Email:</span>
                    <span className="font-medium">{teacher.teacher.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground mr-2">Working Hours:</span>
                    <span className="font-medium">{teacher.teacher_working_hours} hours/week</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Academic Profile
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-muted-foreground block mb-1">Specialization:</span>
                    <span className="font-medium">{teacher.teacher_specialisation || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  Department Information
                </h3>
                {department ? (
                  <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-muted-foreground block mb-1">Department Name:</span>
                      <span className="font-medium">{department.dept_name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Established:</span>
                      <span className="font-medium">{new Date(department.date_established).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Contact:</span>
                      <span className="font-medium">{department.contact_info}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-muted-foreground">No department assigned</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showEditForm && (
        <TeacherForm
          teacher={teacher}
          onClose={() => setShowEditForm(false)}
          disableDepartmentEdit={true}
          onSuccess={() => {
            refetch();
            setShowEditForm(false);
          }}
        />
      )}

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {fullName} from {department?.dept_name}?
              This action will only remove the teacher's department association.
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