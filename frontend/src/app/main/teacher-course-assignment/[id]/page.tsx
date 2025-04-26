import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useGetTeacherCourseAssignment, TeacherCourseAssignment as TCAssignment } from '@/action/teacherCourse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Mail, Phone, Building, Clock, User, BookOpen, Calendar, Hash, Users, Home, ChevronRight, Briefcase, GraduationCap } from 'lucide-react';
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
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm hover:shadow transition-shadow">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              <CardTitle>Course Information</CardTitle>
            </div>
            <CardDescription>Details about the assigned course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 bg-muted/20 rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Course Name
                </div>
                <p className="font-medium text-lg">
                  {assignment.course_detail?.course_detail?.course_name || 'N/A'}
                </p>
              </div>

              <div className="space-y-2 p-4 bg-muted/20 rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  Course Code
                </div>
                <p className="font-medium text-lg">
                  {assignment.course_detail?.course_detail?.course_id || 'N/A'}
                </p>
              </div>

              <div className="space-y-2 p-4 bg-muted/20 rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Academic Year
                </div>
                <p className="font-medium">
                  {assignment.academic_year}
                </p>
              </div>

              <div className="space-y-2 p-4 bg-muted/20 rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Semester
                </div>
                <p className="font-medium">
                  {assignment.semester}
                </p>
              </div>

              <div className="space-y-2 p-4 bg-muted/20 rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Student Count
                </div>
                <p className="font-medium">
                  {assignment.student_count || 'Not specified'}
                </p>
              </div>

              <div className="space-y-2 p-4 bg-muted/20 rounded-md">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Department
                </div>
                <Badge variant="outline" className="font-normal mt-1">
                  {assignment.course_detail?.teaching_dept_detail?.dept_name || 'N/A'}
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="font-medium text-primary">Course Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground">Credits</div>
                  <div className="font-medium mt-1">{assignment.course_detail?.credits || 0}</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground">Lecture Hours</div>
                  <div className="font-medium mt-1">{assignment.course_detail?.lecture_hours || 0}</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground">Practical Hours</div>
                  <div className="font-medium mt-1">{assignment.course_detail?.practical_hours || 0}</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground">Tutorial Hours</div>
                  <div className="font-medium mt-1">{assignment.course_detail?.tutorial_hours || 0}</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground">Regulation</div>
                  <div className="font-medium mt-1">{assignment.course_detail?.regulation || 'N/A'}</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground">Course Type</div>
                  <div className="font-medium mt-1">{assignment.course_detail?.course_type || 'N/A'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              <CardTitle>Teacher Information</CardTitle>
            </div>
            <CardDescription>Details about the assigned teacher</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="p-4 bg-muted/20 rounded-md space-y-2">
              <div className="text-sm text-muted-foreground flex items-center">
                <User className="h-4 w-4 mr-2" />
                Teacher Name
              </div>
              <p className="font-medium text-lg">
                {assignment.teacher_detail?.teacher_id?.first_name || ''} {assignment.teacher_detail?.teacher_id?.last_name || ''}
              </p>
            </div>

            <div className="p-4 bg-muted/20 rounded-md space-y-2">
              <div className="text-sm text-muted-foreground flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </div>
              <p className="font-medium">
                {assignment.teacher_detail?.teacher_id?.email || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-muted/20 rounded-md space-y-2">
              <div className="text-sm text-muted-foreground flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Phone
              </div>
              <p className="font-medium">
                {assignment.teacher_detail?.teacher_id?.phone_number || 'N/A'}
              </p>
            </div>

            <Separator className="my-2" />

            <div className="p-4 bg-muted/20 rounded-md space-y-2">
              <div className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Working Hours
              </div>
              <p className="font-medium">
                {assignment.teacher_detail?.teacher_working_hours || 0} hours
              </p>
            </div>

            <div className="p-4 bg-muted/20 rounded-md space-y-2">
              <div className="text-sm text-muted-foreground flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Department
              </div>
              <Badge variant="outline" className="font-normal mt-1">
                {assignment.teacher_detail?.dept_id?.dept_name || 'Not assigned'}
              </Badge>
            </div>

            <div className="p-4 bg-muted/20 rounded-md space-y-2">
              <div className="text-sm text-muted-foreground flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Role
              </div>
              <Badge className="font-normal mt-1">
                {assignment.teacher_detail?.teacher_role || 'N/A'}
              </Badge>
            </div>

            {assignment.teacher_detail?.teacher_specialisation && (
              <div className="p-4 bg-muted/20 rounded-md space-y-2">
                <div className="text-sm text-muted-foreground flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Specialization
                </div>
                <p className="font-medium">
                  {assignment.teacher_detail.teacher_specialisation}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/10 flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                navigate(`/teacher-course-assignment`);
                toast.info('To delete this assignment, please use the main assignments page.');
              }}
            >
              Delete Assignment
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 