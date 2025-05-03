import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import {
  useGetTeacher,
  useUpdateTeacher,
  Teacher as TeacherType
} from '@/action/teacher';
import { useGetTeacherCourseAssignmentsByTeacher } from '@/action/teacherCourse';
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
import { 
  ChevronLeft, Pencil, Mail, Building, Clock, BookOpen, User, UserMinus, 
  Calendar, GraduationCap, Briefcase 
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TeacherForm from '../form';
import AvailabilityManager from '../availability-manager';

export default function TeacherDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isEditMode = queryParams.get('edit') === 'true';
  const [showEditForm, setShowEditForm] = useState(isEditMode);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const teacherId = parseInt(id as string);

  const { data: teacher, isPending: isLoading, refetch, isFetched } = useGetTeacher(teacherId);
  const { mutate: updateTeacher, isPending: isUpdating } = useUpdateTeacher(teacherId, () => {
    refetch();
    setShowEditForm(false);
  });

  const { data: teacherAssignments = [], isPending: isAssignmentsLoading } = useGetTeacherCourseAssignmentsByTeacher(teacherId);

  const totalTeachingHours = teacherAssignments.reduce((total, assignment) => {
    const credits = assignment.course_detail?.credits || 0;
    return total + credits;
  }, 0);

  useEffect(() => {
    if (isEditMode) {
      const cleanUrl = location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [isEditMode, location.pathname]);

  useEffect(() => {
    if (isFetched && teacher && Object.keys(teacher).length === 0) {
      toast.error("Teacher data not found", {
        description: `We couldn't find the teacher with ID ${teacherId}`
      });
      const timer = setTimeout(() => navigate('/teachers'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isFetched, teacher, teacherId, navigate]);

  if (isLoading || !teacher || Object.keys(teacher).length === 0) {
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

  // Check if the teacher object has the expected properties
  const hasRequiredFields = teacher && 
    (teacher.teacher_role !== undefined) && 
    (teacher.teacher_working_hours !== undefined);
  
  if (!hasRequiredFields) {
    // Handle malformed or incomplete data
    return (
      <div className="py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/teachers')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Teachers
          </Button>
        </div>
        <Card className="shadow-md border-t-4 border-t-destructive p-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Invalid Teacher Data</h2>
            <p className="text-muted-foreground">
              The teacher data received is incomplete or in an unexpected format. 
              Please try again or contact support.
            </p>
            <Button onClick={() => navigate('/teachers')}>
              Return to Teacher List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Access data using the updated interface structure
  const department = teacher.dept_id;
  const userInfo = teacher.teacher_id;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const fullName = userInfo ? `${userInfo.first_name} ${userInfo.last_name}` : '';
  const isPOPOrIndustry = teacher.is_industry_professional || teacher.teacher_role === 'POP' || teacher.teacher_role === 'Industry Professional';

  const handleRemoveFromDepartment = () => {
    console.log('Removing teacher from department...');
    updateTeacher({
      dept_id: null
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

  console.log(teacherAssignments);

  return (
    <div className="w-full mx-auto">

      
      <Card className="shadow-md border-t-4 border-t-primary mb-6">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">
                  {fullName}
                </CardTitle>
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                  {teacher.teacher_role}
                </Badge>
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
                    <span className="font-medium">{userInfo?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-muted-foreground mr-2">Working Hours:</span>
                    <span className="font-medium">{teacher.teacher_working_hours} hours/week</span>
                  </div>
                  {isPOPOrIndustry && (
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-muted-foreground mr-2">Availability:</span>
                      <Badge variant="outline" className={teacher.availability_type === 'limited' ? 'text-amber-600' : ''}>
                        {teacher.availability_type === 'limited' ? 'Limited (Specific Days/Times)' : 'Regular (All Working Days)'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Academic Profile
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-muted-foreground block mb-1">Specialisation:</span>
                    <span className="font-medium">{teacher.teacher_specialisation || 'Not specified'}</span>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground block mb-1">Department:</span>
                    <span className="font-medium">{department ? department.dept_name : 'Not assigned'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  Teaching Load
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-muted-foreground">
                        Current: {totalTeachingHours} / {teacher.teacher_working_hours} hours
                      </span>
                      <span className="text-xs font-medium">
                        {Math.round((totalTeachingHours / teacher.teacher_working_hours) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (totalTeachingHours / teacher.teacher_working_hours) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {isAssignmentsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : teacherAssignments.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No course assignments found
                    </div>
                  ) : (
                    <div className="max-h-[200px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Credits</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teacherAssignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell>
                                {assignment.course_detail?.course_detail?.course_name || 'Unknown Course'}
                              </TableCell>
                              <TableCell>
                                {assignment.is_assistant === true ? (
                                  <Badge variant="outline">Assistant Teacher</Badge>
                                ) : (
                                  <Badge>Primary Teacher</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {assignment.course_detail?.credits || 0}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Availability Management for POP/Industry Professionals */}
      {(isPOPOrIndustry || teacher.availability_type === 'limited') && (
        <AvailabilityManager teacher={teacher} />
      )}

      {/* Remove from Department Confirmation */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Teacher from Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this teacher from {department?.dept_name}?
              This will not delete the teacher from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveFromDepartment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Teacher Form */}
      {showEditForm && (
        <TeacherForm
          teacher={teacher}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            refetch();
          }}
          disableDepartmentEdit={!!department}
        />
      )}
    </div>
  );
} 