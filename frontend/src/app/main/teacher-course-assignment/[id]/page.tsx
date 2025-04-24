import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useGetTeacherCourseAssignment } from '@/action/teacherCourse';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, BookOpen, User, School, Calendar, Users, Mail, Phone, Clock, Award, Building } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export default function TeacherCourseAssignmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const assignmentId = id ? parseInt(id) : 0;

    const { data: assignment, isPending, isError } = useGetTeacherCourseAssignment(assignmentId);

    if (isPending) {
        return (
            <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading assignment details...</p>
            </div>
        );
    }

    if (isError || !assignment) {
        return (
            <div className="container mx-auto p-8 text-center max-w-2xl">
                <div className="bg-destructive/10 p-6 rounded-lg mb-6">
                    <h1 className="text-2xl font-bold mb-4">Assignment Not Found</h1>
                    <p className="text-muted-foreground mb-6">
                        The teacher course assignment you are looking for does not exist or you don't have permission to view it.
                    </p>
                </div>
                <Button onClick={() => navigate('/teacher-course-assignment')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assignments
                </Button>
            </div>
        );
    }

    const { teacher_detail, course_detail, semester, academic_year, student_count } = assignment;
    const teacherInitials = `${teacher_detail.teacher.first_name.charAt(0)}${teacher_detail.teacher.last_name.charAt(0)}`;

    return (
        <div className="container mx-auto space-y-6 px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Teacher Information Card */}
                <Card className="overflow-hidden border-t-4 border-t-blue-500">
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <User className="h-5 w-5 text-blue-500" />
                                    Teacher Information
                                </CardTitle>
                                <CardDescription>
                                    Assigned faculty details
                                </CardDescription>
                            </div>
                            <Avatar className="h-12 w-12 bg-blue-100 text-blue-700">
                                <AvatarFallback>{teacherInitials}</AvatarFallback>
                            </Avatar>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className=" rounded-lg p-5 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Name</p>
                                <p className="font-semibold text-lg">{teacher_detail.teacher.first_name} {teacher_detail.teacher.last_name}</p>
                            </div>
                            
                            <div className="flex items-center">
                                <Mail className="h-4 w-4 text-blue-500 mr-2" />
                                <p className="font-medium break-all">{teacher_detail.teacher.email}</p>
                            </div>
                            
                            <div className="flex items-center">
                                <Phone className="h-4 w-4 text-blue-500 mr-2" />
                                <p className="font-medium">{teacher_detail.teacher.phone_number || 'Not provided'}</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex items-center">
                                    <Award className="h-4 w-4 text-blue-500 mr-2" />
                                    <p className="font-medium">{teacher_detail.staff_code || 'N/A'}</p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                    {teacher_detail.teacher_role}
                                </Badge>
                            </div>
                            
                            <div>
                                <p className="text-sm font-medium text-blue-700">Specialization</p>
                                <p className="font-medium">{teacher_detail.teacher_specialisation || 'N/A'}</p>
                            </div>
                            
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 text-blue-500 mr-2" />
                                <p className="font-medium">{teacher_detail.teacher_working_hours} hours/week</p>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Department</p>
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-blue-500" />
                                <HoverCard>
                                    <HoverCardTrigger asChild>
                                        <span className="font-medium cursor-help underline decoration-dotted">
                                            {teacher_detail.dept.dept_name}
                                        </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Department Information</p>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                <span className="text-sm">{teacher_detail.dept.contact_info}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm">Established: {new Date(teacher_detail.dept.date_established).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Course Information Card */}
                <Card className="overflow-hidden border-t-4 border-t-green-500 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <BookOpen className="h-5 w-5 text-green-500" />
                            Course Information
                        </CardTitle>
                        <CardDescription>
                            Details of the assigned course
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className=" rounded-lg p-5">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Course Name</p>
                                    <p className="font-semibold text-lg">{course_detail.course_name}</p>
                                </div>
                                <div className="flex flex-col items-start md:items-end gap-2">
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                        {course_detail.course_type === 'T' ? 'Theory' : 
                                         course_detail.course_type === 'P' ? 'Practical' : 
                                         course_detail.course_type === 'L' ? 'Lab' : course_detail.course_type}
                                    </Badge>
                                    <p className="text-sm font-medium">{course_detail.course_code}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Year</p>
                                    <p className="font-medium">{course_detail.course_year}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-700">Course Semester</p>
                                    <p className="font-medium">{course_detail.course_semester}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-700">Credits</p>
                                    <p className="font-medium">{course_detail.credits}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-700">Regulation</p>
                                    <p className="font-medium">{course_detail.regulation}</p>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-sm font-medium text-green-700 mb-2">Hours Distribution</p>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white rounded-md p-3 text-center">
                                        <p className="text-sm font-medium text-green-700">Lecture</p>
                                        <p className="font-bold text-xl text-black/70">{course_detail.lecture_hours}</p>
                                    </div>
                                    <div className="bg-white rounded-md p-3 text-center">
                                        <p className="text-sm font-medium text-green-700">Tutorial</p>
                                        <p className="font-bold text-xl text-black/70">{course_detail.tutorial_hours}</p>
                                    </div>
                                    <div className="bg-white rounded-md p-3 text-center">
                                        <p className="text-sm font-medium text-green-700">Practical</p>
                                        <p className="font-bold text-xl text-black/70">{course_detail.practical_hours}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="pt-6 flex flex-col items-center text-center">
                                    <School className="h-8 w-8 text-blue-600 mb-2" />
                                    <p className="text-sm font-medium text-blue-700">Department</p>
                                    <p className="text-lg font-bold text-black/70">{course_detail.department_name}</p>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-amber-50 border-amber-200">
                                <CardContent className="pt-6 flex flex-col items-center text-center">
                                    <Calendar className="h-8 w-8 text-amber-600 mb-2" />
                                    <p className="text-sm font-medium text-amber-700">Assignment Term</p>
                                    <p className="text-lg font-bold text-black/70">Year {academic_year}, Sem {semester}</p>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-purple-50 border-purple-200">
                                <CardContent className="pt-6 flex flex-col items-center text-center">
                                    <Users className="h-8 w-8 text-purple-600 mb-2" />
                                    <p className="text-sm font-medium text-purple-700">Student Count</p>
                                    <p className="text-lg font-bold text-black/70">{student_count}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 