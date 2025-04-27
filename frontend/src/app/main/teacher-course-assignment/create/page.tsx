import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useGetTeachers, Teacher } from '@/action/teacher';
import { useGetCourses, Course } from '@/action/course';
import { useGetTeacherCourseAssignments, useCreateTeacherCourseAssignment } from '@/action/teacherCourse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGetCourseAssignmentStats } from '@/action/course';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function CreateTeacherCourseAssignment() {
    const navigate = useNavigate();
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [semester, setSemester] = useState<string>('');
    const [academicYear, setAcademicYear] = useState<string>('');
    const [studentCount, setStudentCount] = useState<string>('0');

    // Fetch data with loading states
    const { data: teachers = [], isPending: teachersLoading } = useGetTeachers();
    const { data: courses = [], isPending: coursesLoading } = useGetCourses();
    const { data: assignments = [], isPending: assignmentsLoading } = useGetTeacherCourseAssignments();

    // Create assignment mutation
    const createAssignment = useCreateTeacherCourseAssignment(() => {
        toast.success('Teacher course assignment created successfully');
        navigate('/teacher-course-assignment');
    });

    // Calculate teacher's current workload and availability
    const teacherWorkload = useMemo(() => {
        if (!selectedTeacher || !assignments) return null;

        const teacherAssignments = assignments.filter(
            a => a.teacher_detail?.id?.toString() === selectedTeacher
        );

        const selectedTeacherData = teachers.find((t: Teacher) => t.id.toString() === selectedTeacher);
        if (!selectedTeacherData) return null;

        const totalAssignedHours = teacherAssignments.reduce((total, assignment) => {
            return total + (assignment.course_detail?.credits || 0);
        }, 0);

        const availableHours = (selectedTeacherData.teacher_working_hours || 0) - totalAssignedHours;

        return {
            totalAssignedHours,
            availableHours,
            maxHours: selectedTeacherData.teacher_working_hours || 0,
            assignments: teacherAssignments
        };
    }, [selectedTeacher, assignments, teachers]);

    // Filter available courses based on selected teacher's department
    const availableCourses = useMemo(() => {
        if (!selectedTeacher || !teachers || !courses) return [];

        const selectedTeacherData = teachers.find((t: Teacher) => t.id.toString() === selectedTeacher);
        if (!selectedTeacherData || !selectedTeacherData.dept_id) return [];

        return courses.filter(course =>
            course.teaching_dept_id === selectedTeacherData.dept_id.id
        );
    }, [selectedTeacher, teachers, courses]);

    // Get course assignment stats
    const { data: courseStats, isPending: courseStatsLoading } = useGetCourseAssignmentStats(
        selectedCourse ? parseInt(selectedCourse) : undefined
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacher || !selectedCourse || !semester || !academicYear) {
            toast.error('Please fill all required fields');
            return;
        }

        const selectedCourseData = courses.find(c => c.id.toString() === selectedCourse);
        if (!selectedCourseData) return;

        if (teacherWorkload && (teacherWorkload.availableHours < selectedCourseData.credits)) {
            toast.error('Teacher does not have enough available hours for this course');
            return;
        }

        createAssignment.mutate({
            teacher_id: parseInt(selectedTeacher),
            course_id: parseInt(selectedCourse),
            semester: parseInt(semester),
            academic_year: parseInt(academicYear),
            student_count: parseInt(studentCount)
        }, {
            onError: (error: any) => {
                toast.error('Failed to create assignment', {
                    description: error.response?.data?.non_field_errors?.[0] || 'An error occurred'
                });
            }
        });
    };

    return (
        <div className="container mx-auto px-4 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/teacher-course-assignment')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Assignments
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Teacher Workload Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Teacher Workload</CardTitle>
                        <CardDescription>View teacher's current assignments and availability</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Select Teacher</Label>
                            <Select
                                value={selectedTeacher}
                                onValueChange={setSelectedTeacher}
                                disabled={teachersLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={teachersLoading ? "Loading teachers..." : "Select a teacher"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((teacher: Teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                            <div className="flex flex-col">
                                                <span>{teacher.teacher_id?.first_name} {teacher.teacher_id?.last_name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {teacher.staff_code} • {teacher.teacher_role} • {teacher.dept_id?.dept_name || 'No Department'}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {teacherWorkload && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Available Hours</span>
                                        <span>{teacherWorkload.availableHours} / {teacherWorkload.maxHours} hours</span>
                                    </div>
                                    <Progress
                                        value={(teacherWorkload.totalAssignedHours / teacherWorkload.maxHours) * 100}
                                        className="h-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium">Current Assignments</h4>
                                    {teacherWorkload.assignments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No current assignments</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {teacherWorkload.assignments.map(assignment => (
                                                <div key={assignment.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                                                    <div>
                                                        <p className="font-medium">{assignment.course_detail?.course_detail?.course_name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Semester {assignment.semester} • {assignment.academic_year}
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        {assignment.course_detail?.credits} hrs
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Assignment Form and Course Stats */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Assignment</CardTitle>
                            <CardDescription>Assign the selected teacher to a course</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course</Label>
                                    <Select
                                        value={selectedCourse}
                                        onValueChange={setSelectedCourse}
                                        disabled={!selectedTeacher || coursesLoading}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCourses.map((course: Course) => (
                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                    <div className="flex flex-col">
                                                        <span>{course.course_detail?.course_name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {course.course_detail?.course_id} • {course.credits} credits
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="semester">Semester</Label>
                                        <Select
                                            value={semester}
                                            onValueChange={setSemester}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                                    <SelectItem key={sem} value={sem.toString()}>
                                                        Semester {sem}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="academicYear">Academic Year</Label>
                                        <Input
                                            type="number"
                                            id="academicYear"
                                            value={academicYear}
                                            onChange={(e) => setAcademicYear(e.target.value)}
                                            placeholder="e.g., 2024"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="studentCount">Student Count</Label>
                                    <Input
                                        type="number"
                                        id="studentCount"
                                        value={studentCount}
                                        onChange={(e) => setStudentCount(e.target.value)}
                                        placeholder="Number of students"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={createAssignment.isPending}
                                >
                                    {createAssignment.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Assignment...
                                        </>
                                    ) : (
                                        'Create Assignment'
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Course Assignment Stats */}
                    {selectedCourse && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Course Assignment Statistics
                                </CardTitle>
                                <CardDescription>
                                    Current teachers assigned to this course
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {courseStatsLoading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : courseStats && !Array.isArray(courseStats) ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Total Teachers</p>
                                                <p className="text-2xl font-bold">{courseStats.total_teachers}</p>
                                            </div>
                                            <Badge variant="outline" className="text-lg">
                                                {courseStats.course_code}
                                            </Badge>
                                        </div>

                                        {courseStats.teachers.length > 0 ? (
                                            <div className="border rounded-md">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Teacher</TableHead>
                                                            <TableHead>Semester</TableHead>
                                                            <TableHead>Year</TableHead>
                                                            <TableHead>Students</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {courseStats.teachers.map((teacher) => (
                                                            <TableRow key={teacher.teacher_id}>
                                                                <TableCell>{teacher.teacher_name}</TableCell>
                                                                <TableCell>Semester {teacher.semester}</TableCell>
                                                                <TableCell>{teacher.academic_year}</TableCell>
                                                                <TableCell>{teacher.student_count}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-muted-foreground">
                                                No teachers currently assigned to this course
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        Select a course to view assignment statistics
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 