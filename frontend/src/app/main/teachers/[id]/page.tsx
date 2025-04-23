import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { 
  useGetTeacher, 
  useGetDepartment,
  Teacher 
} from '@/action';
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
import { ChevronLeft, Pencil } from 'lucide-react';
import TeacherForm from '../form';

export default function TeacherDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isEditMode = queryParams.get('edit') === 'true';
  const [showEditForm, setShowEditForm] = useState(isEditMode);
  const teacherId = parseInt(id as string);
  
  const { data: teacherData, isPending: isLoadingTeacher, refetch } = useGetTeacher(teacherId);
  const teacher = teacherData?.data as Teacher;
  
  // We don't need to fetch the department separately since it's nested in the teacher response
  const department = teacher?.dept;
  
  const isLoading = isLoadingTeacher;
  
  // Clean up URL if edit parameter exists
  useEffect(() => {
    if (isEditMode) {
      const cleanUrl = location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [isEditMode, location.pathname]);
  
  if (isLoading && !teacher) {
    return (
      <div className="container py-10">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/teachers')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Teachers
          </Button>
        </div>
        <Card>
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
  
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/teachers')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Teachers
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">
              {teacher.teacher.first_name} {teacher.teacher.last_name}
            </CardTitle>
            <CardDescription>{teacher.staff_code || 'No Staff Code'}</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Teacher Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{teacher.teacher.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span>{teacher.teacher_role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span>{department?.dept_name || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialization:</span>
                  <span>{teacher.teacher_specialisation || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Working Hours:</span>
                  <span>{teacher.teacher_working_hours} hours/week</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Department Information</h3>
              {department ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{department.dept_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Established:</span>
                    <span>{new Date(department.date_established).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span>{department.contact_info || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No department assigned</p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Teacher ID: {teacher.id}
          </div>
        </CardFooter>
      </Card>
      
      {showEditForm && (
        <TeacherForm
          mode="update"
          teacher={teacher}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            refetch();
          }}
        />
      )}
    </div>
  );
} 