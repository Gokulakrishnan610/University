import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { 
  useGetCourse, 
  useGetDepartment,
  useGetTeachers,
  Course 
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
import CourseForm from '../form';

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isEditMode = queryParams.get('edit') === 'true';
  const [showEditForm, setShowEditForm] = useState(isEditMode);
  const courseId = parseInt(id as string);
  
  const { data: courseData, isPending: isLoadingCourse, refetch } = useGetCourse(courseId);
  const course = courseData?.data as Course;
  
  const { data: departmentData, isPending: isLoadingDept } = 
    useGetDepartment(course?.course_department || 0);
  const department = departmentData?.data;
  
  const { data: teachersData, isPending: isLoadingTeachers } = useGetTeachers();
  const teachers = teachersData?.data || [];
  
  // Find the assigned teacher
  const assignedTeacher = teachers.find(
    (teacher: any) => teacher.id === course?.course_teacher
  );
  
  const isLoading = isLoadingCourse || isLoadingDept || isLoadingTeachers;
  
  // Clean up URL if edit parameter exists
  useEffect(() => {
    if (isEditMode) {
      const cleanUrl = location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [isEditMode, location.pathname]);
  
  if (isLoading && !course) {
    return (
      <div className="">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/courses')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Courses
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
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/courses')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{course?.course_name}</CardTitle>
            <CardDescription>{course?.course_code}</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{course?.course_description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Course Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits:</span>
                  <span>{course?.course_credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Semester:</span>
                  <span>{course?.course_semester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span>{department?.dept_name}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Instructor</h3>
              {assignedTeacher ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>
                      {assignedTeacher.teacher.first_name} {assignedTeacher.teacher.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span>{assignedTeacher.teacher_role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specialization:</span>
                    <span>{assignedTeacher.teacher_specialisation || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No teacher assigned</p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Course ID: {course?.id}
          </div>
        </CardFooter>
      </Card>
      
      {showEditForm && (
        <CourseForm
          mode="update"
          course={course}
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