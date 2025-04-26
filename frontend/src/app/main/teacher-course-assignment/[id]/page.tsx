import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useGetTeacherCourseAssignment, TeacherCourseAssignment as TCAssignment } from '@/action/teacherCourse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Mail, Phone, Building, Clock, User, BookOpen, Calendar, Hash, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherCourseAssignmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();


  const {
    data: assignment,
    isPending: isLoading,
    error,
  } = useGetTeacherCourseAssignment(id ? parseInt(id) : 0);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load assignment details');
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">Assignment not found. It may have been deleted or you don't have permission to view it.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/teacher-course-assignment')}>
                Return to Assignments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Assignment Details</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Details about the assigned course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Course Name
                </div>
                <p className="font-medium">{assignment.course_detail.course_name}</p>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  Course Code
                </div>
                <p className="font-medium">{assignment.course_detail.course_code}</p>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Academic Year
                </div>
                <p className="font-medium">{assignment.academic_year}</p>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Semester
                </div>
                <p className="font-medium">{assignment.semester}</p>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Student Count
                </div>
                <p className="font-medium">{assignment.student_count || 'Not specified'}</p>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Department
                </div>
                <Badge variant="outline" className="font-normal">
                  {assignment.course_detail.department_name}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-medium">Course Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <div className="mr-2 font-medium">Credits:</div>
                  <div>{assignment.course_detail.credits}</div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 font-medium">Lecture Hours:</div>
                  <div>{assignment.course_detail.lecture_hours}</div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 font-medium">Practical Hours:</div>
                  <div>{assignment.course_detail.practical_hours}</div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 font-medium">Tutorial Hours:</div>
                  <div>{assignment.course_detail.tutorial_hours}</div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 font-medium">Regulation:</div>
                  <div>{assignment.course_detail.regulation}</div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 font-medium">Course Type:</div>
                  <div>{assignment.course_detail.course_type}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teacher Information</CardTitle>
            <CardDescription>Details about the assigned teacher</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <User className="h-4 w-4 mr-2" />
                Teacher Name
              </div>
              <p className="font-medium">
                {assignment.teacher_detail.teacher.first_name} {assignment.teacher_detail.teacher.last_name}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </div>
              <p className="font-medium">{assignment.teacher_detail.teacher.email}</p>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Phone
              </div>
              <p className="font-medium">{assignment.teacher_detail.teacher.phone_number}</p>
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Working Hours
              </div>
              <p className="font-medium">{assignment.teacher_detail.teacher_working_hours} hours</p>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Department
              </div>
              <Badge variant="outline" className="font-normal">
                {assignment.teacher_detail.dept?.dept_name || 'Not assigned'}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center">
                <User className="h-4 w-4 mr-2" />
                Role
              </div>
              <Badge className="font-normal">
                {assignment.teacher_detail.teacher_role}
              </Badge>
            </div>

            {assignment.teacher_detail.teacher_specialisation && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Specialization
                </div>
                <p className="font-medium">{assignment.teacher_detail.teacher_specialisation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

 
        <div className="mt-6 flex justify-end">
          <Button
            variant="destructive"
            onClick={() => {
              navigate(`/teacher-course-assignment`);
              toast.info('To delete this assignment, please use the main assignments page.');
            }}
          >
            Delete Assignment
          </Button>
        </div>
    
    </div>
  );
} 