import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useGetTeachers, Teacher, useGetTeacherAvailability, TeacherAvailability } from '@/action/teacher';
import { useGetCourses, Course } from '@/action/course';
import { useGetTeacherCourseAssignments, useCreateTeacherCourseAssignment } from '@/action/teacherCourse';
import { useGetStudentStats } from '@/action/student';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Users, Calendar, AlertTriangle, Clock, Info } from 'lucide-react';
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
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Define the Zod schema for teacher course assignment
const teacherCourseFormSchema = z.object({
    teacher_id: z.string().min(1, "Teacher is required"),
    assignments: z.array(
        z.object({
            course_id: z.string().min(1, "Course is required"),
            no_of_students: z.number().min(1, "Number of students is required"),
            preferred_availability_slots: z.array(z.string()).optional(),
            is_assistant: z.boolean().default(false),
            show_assistant_option: z.boolean().default(false)
        })
    ).min(1, "At least one course assignment is required"),
});

type TeacherCourseFormValues = z.infer<typeof teacherCourseFormSchema>;

export default function CreateTeacherCourseAssignment() {
    const navigate = useNavigate();
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    const STUDENT_COUNT_OPTIONS = [
        { value: 70, label: "70 students" },
        { value: 140, label: "140 students" },
        { value: 210, label: "210 students" },
        { value: 280, label: "280 students" }
    ];

    // Fetch data with loading states
    const { data: teachers = [], isPending: teachersLoading } = useGetTeachers();
    const { data: courses = [], isPending: coursesLoading } = useGetCourses();
    const { data: assignments = [], isPending: assignmentsLoading } = useGetTeacherCourseAssignments();
    const { data: studentStats, isPending: statsLoading } = useGetStudentStats();

    // Fetch teacher availability if a teacher is selected
    const { data: teacherAvailability = [], isPending: availabilityLoading } =
        useGetTeacherAvailability(selectedTeacher ? parseInt(selectedTeacher) : 0);

    // Setup form with Zod  
    const form = useForm<TeacherCourseFormValues>({
        resolver: zodResolver(teacherCourseFormSchema),
        defaultValues: {
            teacher_id: "",
            assignments: [{
                course_id: "",
                no_of_students: 70,
                preferred_availability_slots: [],
                is_assistant: false,
                show_assistant_option: false,
            }],
        },
    });

    const addAssignmentCard = () => {
        form.setValue("assignments", [
            ...form.watch("assignments"),
            {
                course_id: "",
                no_of_students: 70,
                preferred_availability_slots: [],
                is_assistant: false,
                show_assistant_option: false,
            }
        ]);
    };

    const removeAssignmentCard = (index: number) => {
        const assignments = form.watch("assignments");
        if (assignments.length <= 1) return; // Don't remove the last one

        const newAssignments = [...assignments];
        newAssignments.splice(index, 1);
        form.setValue("assignments", newAssignments);
    };

    // Create assignment mutation
    const createAssignment = useCreateTeacherCourseAssignment(() => {
        toast.success('Teacher course assignment created successfully');
        navigate('/teacher-course-assignment');
    });

    // Transform teachers into combobox options
    const teacherOptions: ComboboxOption[] = useMemo(() => {
        return teachers.map((teacher: Teacher) => ({
            value: teacher.id.toString(),
            label: teacher.is_placeholder
                ? `[Placeholder] ${teacher.placeholder_description || 'Unnamed'} (${teacher.staff_code || 'No Code'} - ${teacher.dept_id?.dept_name || 'No Department'})`
                : `${teacher.teacher_id?.first_name} ${teacher.teacher_id?.last_name} (${teacher.staff_code} - ${teacher.dept_id?.dept_name || 'No Department'})${teacher.is_industry_professional ? ' 🏢' : ''}`
        }));
    }, [teachers]);

    // Find selected teacher data
    const selectedTeacherData = useMemo(() => {
        if (!selectedTeacher) return null;
        return teachers.find((t: Teacher) => t.id.toString() === selectedTeacher);
    }, [selectedTeacher, teachers]);

    // Check if selected teacher is a POP/industry professional
    const isPOPOrIndustry = useMemo(() => {
        if (!selectedTeacherData) return false;
        return selectedTeacherData.is_industry_professional ||
            selectedTeacherData.teacher_role === 'POP' ||
            selectedTeacherData.teacher_role === 'Industry Professional';
    }, [selectedTeacherData]);

    // Check if teacher has limited availability
    const hasLimitedAvailability = useMemo(() => {
        if (!selectedTeacherData) return false;
        return selectedTeacherData.availability_type === 'limited';
    }, [selectedTeacherData]);

    // Calculate teacher's current workload and availability
    const teacherWorkload = useMemo(() => {
        if (!selectedTeacher || !assignments) return null;

        const teacherAssignments = assignments.filter(
            a => a.teacher_detail?.id?.toString() === selectedTeacher
        );

        if (!selectedTeacherData) return null;

        // Calculate total assigned hours using LTP instead of just credits
        const totalAssignedHours = teacherAssignments.reduce((total, assignment) => {
            const course = assignment.course_detail;
            if (!course) return total;

            // Calculate LTP hours based on course type
            const lectureHours = course.lecture_hours || 0;
            const tutorialHours = course.tutorial_hours || 0;
            const practicalHours = course.practical_hours || 0;

            if (course.course_type === 'T') { // Theory
                return total + lectureHours + tutorialHours;
            } else if (course.course_type === 'LoT') { // Lab and Theory
                return total + lectureHours + tutorialHours + practicalHours;
            } else if (course.course_type === 'L') { // Lab only
                return total + practicalHours;
            }

            return total + (course.credits || 0); // Fallback to credits if course type is unknown
        }, 0);

        const availableHours = (selectedTeacherData.teacher_working_hours || 0) - totalAssignedHours;

        return {
            totalAssignedHours,
            availableHours,
            maxHours: selectedTeacherData.teacher_working_hours || 0,
            assignments: teacherAssignments
        };
    }, [selectedTeacher, assignments, selectedTeacherData]);

    // Check if teacher is resigning or has resigned
    const isTeacherResigning = useMemo(() => {
        if (!selectedTeacherData) return false;
        return selectedTeacherData.resignation_status === 'resigning';
    }, [selectedTeacherData]);

    const isTeacherResigned = useMemo(() => {
        if (!selectedTeacherData) return false;
        return selectedTeacherData.resignation_status === 'resigned';
    }, [selectedTeacherData]);

    // Filter available courses based on selected teacher's department
    const availableCourses = useMemo(() => {
        if (!selectedTeacher || !teachers || !courses) return [];

        const selectedTeacherData = teachers.find((t: Teacher) => t.id.toString() === selectedTeacher);
        if (!selectedTeacherData || !selectedTeacherData.dept_id) return [];

        // For POP/industry professionals, we could potentially allow cross-department teaching
        if (isPOPOrIndustry) {
            return courses;
        }

        return courses.filter(course =>
            course.teaching_dept_id === selectedTeacherData.dept_id.id
        );
    }, [selectedTeacher, teachers, courses, isPOPOrIndustry]);

    // Helper function to calculate LTP hours for a course
    const calculateLTPHours = (course: Course) => {
        if (!course) return 0;

        const lectureHours = course.lecture_hours || 0;
        const tutorialHours = course.tutorial_hours || 0;
        const practicalHours = course.practical_hours || 0;

        if (course.course_type === 'T        ') { // Theory
            return lectureHours + tutorialHours;
        } else if (course.course_type === 'LoT') { // Lab and Theory
            return lectureHours + tutorialHours + practicalHours;
        } else if (course.course_type === 'L') { // Lab only
            return practicalHours;
        }

        return course.credits || 0; // Fallback to credits if course type is unknown
    };

    // Transform filtered courses into combobox options
    const courseOptions: ComboboxOption[] = useMemo(() => {
        return availableCourses.map((course: Course) => ({
            value: course.id.toString(),
            label: `${course.course_detail?.course_name} - ${course.id} - (${course.course_detail?.course_id}- L:${course.lecture_hours || 0} T:${course.tutorial_hours || 0} P:${course.practical_hours || 0} - ${calculateLTPHours(course)} hrs)`
        }));
    }, [availableCourses]);

    // Sort availability slots by day and time
    const sortedAvailability = useMemo(() => {
        if (!teacherAvailability) return [];
        return [...teacherAvailability].sort((a, b) => {
            if (a.day_of_week !== b.day_of_week) {
                return a.day_of_week - b.day_of_week;
            }
            return a.start_time.localeCompare(b.start_time);
        });
    }, [teacherAvailability]);

    // Calculate required teachers based on student count (1 teacher per 70 students, max 5)
    // New logic: For every 70 students (or fraction thereof), 1 teacher is required
    const calculateRequiredTeachers = (studentCount: number) => {
        // Calculate required teachers based on the rule: 1 teacher per 70 students
        // Use ceiling to handle fractional requirements (e.g., 100 students = 2 teachers)
        const requiredTeachers = Math.ceil(studentCount / 70);

        // Cap at 5 teachers maximum
        return Math.min(requiredTeachers, 5);
    };

    // Get student count for a course based on year and semester from student stats
    const getStudentCountForCourse = (courseId: string | number) => {
        if (!studentStats || statsLoading) return 70; // Default fallback

        const courseData = courses.find(c => c.id.toString() === courseId.toString());
        if (!courseData) return 70;

        const year = courseData.course_year;
        const semester = courseData.course_semester;

        // Find student count for this year from stats
        const yearCount = studentStats.by_year.find(y => y.year === year)?.count || 0;
        const semesterCount = studentStats.by_semester.find(s => s.current_semester === semester)?.count || 0;

        // Use the more specific count if available, otherwise use a reasonable estimate
        const count = semesterCount > 0 ? semesterCount : yearCount;
        return count > 0 ? count : 70; // Default to 70 if no stats available
    };

    // Get course assignment stats
    const getSelectedCourseStats = (courseId: string) => {
        if (!courseId) return null;

        // Get the course data from our courses list
        const courseData = courses.find(c => c.id.toString() === courseId);
        if (!courseData) return null;

        // Get current assignments for this course
        const courseAssignments = assignments.filter(
            a => a.course_detail?.id.toString() === courseId
        );

        return {
            course: courseData,
            assignments: courseAssignments,
            studentCount: getStudentCountForCourse(courseId),
            requiredTeachers: calculateRequiredTeachers(getStudentCountForCourse(courseId)),
            needsAssistant: courseData.need_assist_teacher
        };
    };

    // Find selected course data
    const selectedCourseData = useMemo(() => {
        if (!selectedCourse) return null;
        return courses.find((c: Course) => c.id.toString() === selectedCourse);
    }, [selectedCourse, courses]);

    // Update handleTeacherChange function
    const handleTeacherChange = (value: string) => {
        setSelectedTeacher(value);
        form.setValue("teacher_id", value);

        // Clear all course selections when teacher changes
        const assignments = form.getValues("assignments");
        const clearedAssignments = assignments.map(assignment => ({
            ...assignment,
            course_id: "",
            preferred_availability_slots: [],
            is_assistant: false,
            show_assistant_option: false
        }));
        form.setValue("assignments", clearedAssignments);

        // Reset the selected course state
        setSelectedCourse('');
    };

    const handleCourseChange = (value: string, index: number) => {
        const assignments = form.watch("assignments");
        const newAssignments = [...assignments];
        newAssignments[index].course_id = value;

        // Update student count based on stats if we have a valid course
        if (value) {
            const studentCount = getStudentCountForCourse(value);
            newAssignments[index].no_of_students = studentCount;

            // Check if course needs assistant teacher
            const courseData = courses.find(c => c.id.toString() === value);
            if (courseData && courseData.need_assist_teacher) {
                // Only show the assistant option for this specific assignment
                newAssignments[index].show_assistant_option = true;
            } else {
                newAssignments[index].show_assistant_option = false;
                newAssignments[index].is_assistant = false;
            }
        }

        form.setValue("assignments", newAssignments);

        // Keep track of all selected courses
        const updatedCourses = form.getValues("assignments")
            .map(a => a.course_id)
            .filter(Boolean) as string[];
        setSelectedCourses(updatedCourses);

        // Update the selected course for stats display (show stats for the first course)
        if (index === 0) {
            setSelectedCourse(value);
        }
    };

    const onSubmit = async (data: TeacherCourseFormValues) => {
        // Validate all assignments before submitting
        const errors: string[] = [];

        // Check for duplicate course selections within the form
        const courseSelections = data.assignments.map(a => a.course_id);
        const uniqueCourseSelections = new Set(courseSelections);

        if (courseSelections.length !== uniqueCourseSelections.size) {
            // Find the duplicates
            const duplicateCourses: string[] = [];
            const seen = new Set<string>();

            courseSelections.forEach(courseId => {
                if (seen.has(courseId)) {
                    const course = courses.find(c => c.id.toString() === courseId);
                    if (course) {
                        duplicateCourses.push(`${course.course_detail?.course_name} (${course.course_detail?.course_id})`);
                    }
                } else {
                    seen.add(courseId);
                }
            });

            toast.error('Duplicate course selections', {
                description: `You've selected the same course multiple times: ${duplicateCourses.join(', ')}`
            });
            return;
        }

        // Validate workload and other requirements
        for (let index = 0; index < data.assignments.length; index++) {
            const assignment = data.assignments[index];
            const selectedCourseData = courses.find(c => c.id.toString() === assignment.course_id);
            if (!selectedCourseData) {
                errors.push(`Assignment ${index + 1}: Invalid course selected`);
                continue;
            }

            // Check teacher workload for each assignment
            if (teacherWorkload && (teacherWorkload.availableHours < selectedCourseData.credits)) {
                errors.push(`Teacher does not have enough available hours for ${selectedCourseData.course_detail?.course_name}`);
            }

            // Check for existing assignments in the system
            const existingAssignment = assignments.find(a =>
                a.teacher_detail?.id.toString() === data.teacher_id &&
                a.course_detail?.id.toString() === assignment.course_id
            );

            if (existingAssignment) {
                const courseName = selectedCourseData.course_detail?.course_name;
                const teacherName = teachers.find((t: any) => t.id.toString() === data.teacher_id)?.teacher_id?.first_name || 'This teacher';
                errors.push(`${teacherName} is already assigned to ${courseName}. A teacher cannot be assigned to the same course multiple times.`);
            }
        }

        if (errors.length > 0) {
            toast.error('Validation errors', {
                description: errors.join('\n')
            });
            return;
        }

        // Create each assignment sequentially to properly handle errors
        try {
            // Show loading toast
            const loadingToast = toast.loading('Creating assignments...');

            let successCount = 0;
            let failureCount = 0;
            const failureMessages: string[] = [];

            // Process assignments one by one
            for (const assignment of data.assignments) {
                const selectedCourseData = courses.find(c => c.id.toString() === assignment.course_id);
                if (!selectedCourseData) continue;

                const preferred_slots = assignment.preferred_availability_slots?.map(id => parseInt(id)) || [];
                // const studentCount = getStudentCountForCourse(assignment.course_id);
                const studentCount = assignment.no_of_students;
                try {
                    await createAssignment.mutateAsync({
                        teacher_id: parseInt(data.teacher_id),
                        course_id: parseInt(assignment.course_id),
                        semester: selectedCourseData.course_semester || 1,
                        academic_year: selectedCourseData.course_year || new Date().getFullYear(),
                        student_count: studentCount,
                        is_assistant: assignment.is_assistant,
                        preferred_availability_slots: preferred_slots
                    });

                    successCount++;
                } catch (error: any) {
                    failureCount++;
                    const courseName = selectedCourseData.course_detail?.course_name || 'Unknown course';
                    let errorMessage = `Failed to assign to ${courseName}`;

                    // Check for unique constraint violation
                    if (error?.response?.data?.non_field_errors?.includes('The fields teacher_id, course_id must make a unique set.')) {
                        errorMessage = `${courseName}: Teacher is already assigned to this course`;
                    } else if (error?.response?.data?.non_field_errors) {
                        errorMessage = `${courseName}: ${error.response.data.non_field_errors.join(', ')}`;
                    } else if (error?.message) {
                        errorMessage = `${courseName}: ${error.message}`;
                    }

                    failureMessages.push(errorMessage);
                }
            }

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            // Show appropriate completion message
            if (successCount > 0 && failureCount === 0) {
                toast.success(`Successfully created ${successCount} assignment(s)`);
                navigate('/teacher-course-assignment');
            } else if (successCount > 0 && failureCount > 0) {
                toast.warning(`Created ${successCount} assignment(s), but ${failureCount} failed`, {
                    description: failureMessages.join('\n')
                });
            } else {
                toast.error('Failed to create any assignments', {
                    description: failureMessages.join('\n')
                });
            }
        } catch (error: any) {
            toast.error('An unexpected error occurred', {
                description: error?.message || 'Please try again later'
            });
        }
    };

    return (
        <div className="container mx-auto px-4 space-y-8">
            <div className="flex items-center space-x-2 mb-6">
                <h1 className="text-xl font-bold">Create New Course Assignment</h1>
            </div>

            {/* Course Statistics for Selected Courses */}
            {selectedCourses.length > 0 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Selected Course Statistics</CardTitle>
                        <CardDescription>
                            Information about the courses you're assigning and required teachers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {selectedCourses.map(courseId => {
                                const courseData = courses.find(c => c.id.toString() === courseId);
                                if (!courseData) return null;

                                const studentCount = getStudentCountForCourse(courseId);
                                const requiredTeachers = calculateRequiredTeachers(studentCount);

                                // Find current teacher assignments for this course
                                const courseAssignments = assignments.filter(
                                    a => a.course_detail?.id.toString() === courseId
                                );

                                return (
                                    <div key={courseId} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-medium">{courseData.course_detail?.course_name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {courseData.course_detail?.course_id} - Year {courseData.course_year}, Semester {courseData.course_semester}
                                                </p>
                                            </div>
                                            <Badge variant={courseAssignments.length >= requiredTeachers ? "outline" : "destructive"}>
                                                {courseAssignments.length} / {requiredTeachers} teachers
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <div className="bg-secondary/10 p-2 rounded-md">
                                                <div className="text-sm text-muted-foreground">Assigned Teachers</div>
                                                <div className="font-medium text-xl">{courseAssignments.length}</div>
                                            </div>
                                            <div className="bg-secondary/10 p-2 rounded-md">
                                                <div className="text-sm text-muted-foreground">Total Students</div>
                                                <div className="font-medium text-xl">{studentCount}</div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-sm font-medium">Teacher Requirements</h4>
                                                <Badge variant={courseAssignments.length >= requiredTeachers ? "outline" : "destructive"}>
                                                    {courseAssignments.length} / {requiredTeachers} teachers
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <div className="text-sm text-muted-foreground mb-1">
                                                        <span className="font-medium">Semester:</span> {courseData.course_semester}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mb-1">
                                                        <span className="font-medium">Academic Year:</span> {courseData.course_year}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground mb-1">
                                                        <span className="font-medium">Total Students:</span> {studentCount}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mb-1">
                                                        <span className="font-medium">Year {courseData.course_year} Students:</span> {studentCount}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm bg-secondary/10 p-2 mt-2 rounded">
                                                <span className={courseAssignments.length >= requiredTeachers ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                                    {courseAssignments.length >= requiredTeachers ? "Adequate" : "Inadequate"}
                                                </span> teacher staffing for this course.
                                                <br />
                                                <span className="text-xs">
                                                    This course has {studentCount} students, requiring {requiredTeachers} {requiredTeachers === 1 ? 'teacher' : 'teachers'} based on the 70 students per teacher rule.
                                                </span>
                                                {courseAssignments.length > 0 && courseAssignments.length < requiredTeachers && (
                                                    <span className="block mt-1 text-xs text-amber-600">
                                                        Currently {courseAssignments.length} teacher(s) assigned. Need {requiredTeachers - courseAssignments.length} more.
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {courseAssignments.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium mb-2">Current Assignments</h4>
                                                <div className="border rounded-md overflow-hidden">
                                                    <Table>
                                                        <TableHeader className="bg-muted/30">
                                                            <TableRow>
                                                                <TableHead>Teacher</TableHead>
                                                                <TableHead>Role</TableHead>
                                                                <TableHead>Students</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {courseAssignments.map(assignment => (
                                                                <TableRow key={assignment.id}>
                                                                    <TableCell className="font-medium">
                                                                        {assignment.teacher_detail?.teacher_id?.first_name} {assignment.teacher_detail?.teacher_id?.last_name}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant={assignment.is_assistant ? "outline" : "default"}>
                                                                            {assignment.is_assistant ? "Assistant" : "Primary"}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>{assignment.student_count || 0}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Teacher Workload Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Teacher Information</CardTitle>
                        <CardDescription>View teacher's details, workload and availability</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Select Teacher</Label>
                            <Combobox
                                options={teacherOptions}
                                value={selectedTeacher}
                                onValueChange={handleTeacherChange}
                                placeholder={teachersLoading ? "Loading teachers..." : "Search for a teacher"}
                                searchPlaceholder="Search by name or department..."
                                emptyMessage="No teachers found"
                                disabled={teachersLoading}
                            />
                        </div>

                        {isTeacherResigned && (
                            <Alert className="bg-red-50 border-red-300">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <AlertTitle className="text-red-600">Teacher Has Resigned</AlertTitle>
                                <AlertDescription className="text-red-700">
                                    This teacher has resigned and cannot be assigned to courses.
                                </AlertDescription>
                            </Alert>
                        )}

                        {isTeacherResigning && (
                            <Alert className="bg-amber-50 border-amber-300">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-600">Teacher Is Resigning</AlertTitle>
                                <AlertDescription className="text-amber-700">
                                    This teacher is in the process of resigning. Assigning them to courses is not recommended.
                                </AlertDescription>
                            </Alert>
                        )}

                        {isPOPOrIndustry && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-600">Industry Professional / POP</AlertTitle>
                                <AlertDescription className="text-amber-700">
                                    This teacher is an industry professional with {hasLimitedAvailability ? 'limited' : 'regular'} availability.
                                    {hasLimitedAvailability && ' Please select their availability slots below.'}
                                </AlertDescription>
                            </Alert>
                        )}

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
                                            {teacherWorkload.assignments.map(assignment => {
                                                const course = assignment.course_detail;
                                                // Calculate LTP hours for display
                                                const lectureHours = course?.lecture_hours || 0;
                                                const tutorialHours = course?.tutorial_hours || 0;
                                                const practicalHours = course?.practical_hours || 0;
                                                let ltpHours = course?.credits || 0;

                                                if (course?.course_type === 'T') {
                                                    ltpHours = lectureHours + tutorialHours;
                                                } else if (course?.course_type === 'LoT') {
                                                    ltpHours = lectureHours + tutorialHours + practicalHours;
                                                } else if (course?.course_type === 'L') {
                                                    ltpHours = practicalHours;
                                                }

                                                return (
                                                    <div key={assignment.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                                                        <div>
                                                            <p className="font-medium">{assignment.course_detail?.course_detail?.course_name}</p>
                                                            <p className="text-xs text-muted-foreground">L:{lectureHours} T:{tutorialHours} P:{practicalHours}</p>
                                                        </div>
                                                        <Badge variant="secondary">
                                                            {ltpHours} hrs
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {hasLimitedAvailability && selectedTeacherData && (
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <h4 className="font-medium">Availability Schedule</h4>
                                </div>

                                {availabilityLoading ? (
                                    <div className="flex justify-center my-4">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : sortedAvailability.length === 0 ? (
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>No availability defined</AlertTitle>
                                        <AlertDescription>
                                            This teacher has no availability slots defined yet.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <div className="border rounded-md overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-muted/30">
                                                <TableRow>
                                                    <TableHead>Day</TableHead>
                                                    <TableHead>Time</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedAvailability.map((slot: TeacherAvailability) => (
                                                    <TableRow key={slot.id}>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {slot.day_name}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center">
                                                                <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                                                                <span>{slot.start_time} - {slot.end_time}</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Assignment Form and Course Stats */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Assignments</CardTitle>
                            <CardDescription>Assign the selected teacher to one or more courses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    {form.watch("assignments").map((assignment, index) => (
                                        <div key={index} className="space-y-4 border p-4 rounded-lg mb-4 relative">
                                            {index > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                                                    onClick={() => removeAssignmentCard(index)}
                                                >
                                                    Remove
                                                </Button>
                                            )}

                                            <FormField
                                                control={form.control}
                                                name={`assignments.${index}.course_id`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Course {index + 1}</FormLabel>
                                                        <FormControl>
                                                            <Combobox
                                                                options={courseOptions}
                                                                value={field.value}
                                                                onValueChange={(value) => handleCourseChange(value, index)}
                                                                placeholder={
                                                                    !selectedTeacher
                                                                        ? "Select a teacher first"
                                                                        : coursesLoading
                                                                            ? "Loading courses..."
                                                                            : courseOptions.length === 0
                                                                                ? "No available courses"
                                                                                : "Select a course"
                                                                }
                                                                disabled={!selectedTeacher || coursesLoading || courseOptions.length === 0}
                                                                emptyMessage="No courses found for this teacher's department"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`assignments.${index}.no_of_students`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Number of Students</FormLabel>
                                                    <Select 
                                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                                        value={field.value?.toString()}
                                                        disabled={!selectedTeacher || coursesLoading || courseOptions.length === 0}
                                                    >
                                                        <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select number of students" />
                                                        </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                        {STUDENT_COUNT_OPTIONS.map((option) => (
                                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                            {option.label}
                                                            </SelectItem>
                                                        ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Show assistant teacher option when course needs assistant */}
                                            {assignment.show_assistant_option && (
                                                <FormField
                                                    control={form.control}
                                                    name={`assignments.${index}.is_assistant`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                            <FormControl>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={field.value}
                                                                    onChange={field.onChange}
                                                                    className="rounded text-primary"
                                                                />
                                                            </FormControl>
                                                            <div className="space-y-1 leading-none">
                                                                <FormLabel>
                                                                    Assign as Assistant Teacher
                                                                </FormLabel>
                                                                <p className="text-sm text-muted-foreground">
                                                                    This course requires or allows assistant teachers
                                                                </p>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            {/* Availability slots selection for industry professionals */}
                                            {isPOPOrIndustry && hasLimitedAvailability && sortedAvailability.length > 0 && (
                                                <FormField
                                                    control={form.control}
                                                    name={`assignments.${index}.preferred_availability_slots`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Preferred Availability Slots</FormLabel>
                                                            <div className="space-y-2">
                                                                {sortedAvailability.map((slot) => (
                                                                    <div key={slot.id} className="flex items-center space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`slot-${slot.id}-${index}`}
                                                                            value={slot.id}
                                                                            checked={field.value?.includes(slot.id.toString())}
                                                                            onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                const currentValues = field.value || [];
                                                                                const newValues = e.target.checked
                                                                                    ? [...currentValues, value]
                                                                                    : currentValues.filter(v => v !== value);
                                                                                field.onChange(newValues);
                                                                            }}
                                                                            className="rounded text-primary"
                                                                        />
                                                                        <label htmlFor={`slot-${slot.id}-${index}`} className="text-sm">
                                                                            {slot.day_name} ({slot.start_time} - {slot.end_time})
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    <div className="flex justify-between">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addAssignmentCard}
                                            disabled={!selectedTeacher}
                                        >
                                            Add Another Course
                                        </Button>

                                        <Button
                                            type="submit"
                                            disabled={!selectedTeacher || createAssignment.isPending}
                                        >
                                            {createAssignment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Create Assignments
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 