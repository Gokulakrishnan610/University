import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useGetTeachers, Teacher, useGetTeacherAvailability, TeacherAvailability } from '@/action/teacher';
import { useGetCourses, Course } from '@/action/course';
import { useGetTeacherCourseAssignments, useCreateTeacherCourseAssignment } from '@/action/teacherCourse';
import { useGetDepartmentStudentCount, DepartmentStudentCount } from '@/action/student';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Users, Calendar, AlertTriangle, Clock, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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
            no_of_students: z.number().min(1, "Number of students must be at least 1"),
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

        if (course.course_type === 'T') { // Theory
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
            label: `${course.course_detail?.course_name} - ${course.course_year} year - (${course.course_detail?.course_id}) [L:${course.lecture_hours || 0}|T:${course.tutorial_hours || 0}|P:${course.practical_hours || 0}] - For: ${course.for_dept_detail.dept_name}`
        }));
    }, [availableCourses]);

    // Get the for_dept ID for a selected course
    const getForDeptId = (courseId: string | number) => {
        if (!courseId || !availableCourses) return null;
        
        const course = availableCourses.find(c => c.id.toString() === courseId.toString());
        if (!course) return null;
        
        return course.for_dept_id;
    };

    // Fetch department student count for the first selected course if any
    const firstCourseId = form.watch("assignments")[0]?.course_id;
    const firstCourseDeptId = firstCourseId ? getForDeptId(firstCourseId) : null;
    const { data: deptStudentCount } = useGetDepartmentStudentCount(firstCourseDeptId || 0);

    // Get student counts for a specific year from department data
    const getYearStudentCount = (deptStudentData: DepartmentStudentCount | undefined, year: number): number => {
        if (!deptStudentData) return 0;
        
        const yearData = deptStudentData.year_breakdown.find((y: { year: number; count: number }) => y.year === year);
        return yearData?.count || 0;
    };

    // Get student count for a course from for_dept
    const getStudentCountForCourse = (courseId: string | number) => {
        if (!courseId || !availableCourses) return 0;
        
        const course = availableCourses.find(c => c.id.toString() === courseId.toString());
        if (!course) return 0;
        
        // If we have department student count data and this course is from that department,
        // use the more accurate department student count
        if (deptStudentCount && course.for_dept_id === deptStudentCount.department_id) {
            // First try to get year-specific student count
            const yearStudents = getYearStudentCount(deptStudentCount, course.course_year);
            if (yearStudents > 0) {
                return yearStudents;
            }
            
            // If no year-specific data, use department total with estimation
            if (deptStudentCount.total_students > 0) {
                // Rough estimate: divide total by 4 years (assuming 4-year programs)
                return Math.round(deptStudentCount.total_students / 4);
            }
        }
        
        // Fallback to course's no_of_students field
        return course.no_of_students || 0;
    };

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
        // If student count is very low, still require at least 1 teacher
        if (studentCount <= 0) return 1;

        // Calculate required teachers based on the rule: 1 teacher per 70 students
        // Use ceiling to handle fractional requirements (e.g., 100 students = 2 teachers)
        const requiredTeachers = Math.ceil(studentCount / 70);

        // Cap at 5 teachers maximum
        return Math.min(requiredTeachers, 5);
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

    // Handle course change with enhanced validation
    const handleCourseChange = (value: string, index: number) => {
        const assignments = form.watch("assignments");
        const newAssignments = [...assignments];

        // Update the course ID
        newAssignments[index].course_id = value;

        // If we have a valid course selection
        if (value) {
            const selectedCourseData = courses.find(c => c.id.toString() === value);
            if (selectedCourseData) {
                // Get the for_dept_id to fetch department student data
                const forDeptId = selectedCourseData.for_dept_id;
                
                // Set default student count from course
                let studentCount = selectedCourseData.no_of_students || 0;
                
                // If we have department data for this course's department
                if (deptStudentCount && forDeptId === deptStudentCount.department_id) {
                    // Get year-specific student count
                    const yearStudentCount = getYearStudentCount(deptStudentCount, selectedCourseData.course_year);
                    
                    if (yearStudentCount > 0) {
                        // If we have year-specific data, use it
                        studentCount = yearStudentCount;
                        toast.info(`Using ${yearStudentCount} students from year ${selectedCourseData.course_year} data`, {
                            duration: 3000,
                        });
                    } else {
                        // Otherwise use total department count
                        studentCount = deptStudentCount.total_students;
                        toast.info(`Using total department student count: ${studentCount}`, {
                            duration: 3000,
                        });
                    }
                } else if (selectedCourseData.no_of_students <= 0) {
                    // If course has no student count, use default
                    studentCount = 70;
                    toast.info('No department data available, using default student count', {
                        duration: 3000,
                    });
                }
                
                // Update the student count
                newAssignments[index].no_of_students = studentCount;
                
                // Check if course needs assistant teacher
                newAssignments[index].show_assistant_option = selectedCourseData.need_assist_teacher || false;
            }
        }

        form.setValue("assignments", newAssignments);

        // Update selected courses state for UI filtering
        setSelectedCourses(newAssignments.map(a => a.course_id).filter(id => !!id));
        
        // If this is the first course changed, update selectedCourse for stats display
        if (index === 0) {
            setSelectedCourse(value);
            
            // If we have a valid course with a for_dept_id that's different from our current deptStudentCount
            const selectedCourseData = courses.find(c => c.id.toString() === value);
            if (selectedCourseData && 
                selectedCourseData.for_dept_id && 
                (!deptStudentCount || selectedCourseData.for_dept_id !== deptStudentCount.department_id)) {
                
                // Trigger a refetch of department data for this specific course's department
                // This will automatically update our student counts when the data arrives
                const { refetch } = useGetDepartmentStudentCount(selectedCourseData.for_dept_id);
                refetch();
            }
        }
    };

    const onSubmit = async (data: TeacherCourseFormValues) => {
        // Validate all assignments before submitting
        const errors: string[] = [];

        // We no longer need to check for duplicate course selections within the form
        // since multiple teachers can be assigned to the same course

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

            // Validate student count against departmental data if available
            const forDeptId = selectedCourseData.for_dept_id;
            
            if (deptStudentCount && forDeptId === deptStudentCount.department_id) {
                const totalStudents = deptStudentCount.total_students;
                const yearStudents = getYearStudentCount(deptStudentCount, selectedCourseData.course_year);
                
                // Prioritize year-specific validation if available
                if (yearStudents > 0) {
                    // Check if student count exceeds year total
                    if (assignment.no_of_students > yearStudents * 1.2) { // Allow 20% buffer
                        errors.push(`Assignment ${index + 1}: Student count (${assignment.no_of_students}) exceeds the expected students in year ${selectedCourseData.course_year} (${yearStudents})`);
                    }
                } else if (totalStudents > 0) {
                    // Fall back to total department validation
                    // Calculate expected students per year (rough estimate)
                    const avgYearSize = totalStudents / 4; // Assuming 4 year programs
                    
                    if (assignment.no_of_students > avgYearSize * 1.5) { // Allow 50% buffer for this rough estimate
                        errors.push(`Assignment ${index + 1}: Student count (${assignment.no_of_students}) seems too high given department size (${totalStudents} total students)`);
                    }
                }
                
                // For all department validations, check minimum
                if (assignment.no_of_students < 1) {
                    errors.push(`Assignment ${index + 1}: Student count must be at least 1`);
                }
                
                // Also look at per-teacher limit
                const requiredTeachers = calculateRequiredTeachers(assignment.no_of_students);
                
                // Find existing assignments for this course
                const existingAssignments = assignments.filter(a => a.course_detail?.id.toString() === assignment.course_id);
                
                // If this is a new assignment and we exceed teacher requirements, warn
                if (existingAssignments.length >= requiredTeachers) {
                    errors.push(`Warning: Course "${selectedCourseData.course_detail?.course_name}" already has ${existingAssignments.length} teachers assigned, which meets the calculated requirement of ${requiredTeachers} teachers based on student count.`);
                }
            }
        }

        if (errors.length > 0) {
            toast.error('Validation errors', {
                description: errors.join('\n')
            });
            return;
        }

        // Create each assignment sequentially to handle errors
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
                const studentCount = assignment.no_of_students;
                try {
                    await createAssignment.mutateAsync({
                        teacher_id: parseInt(data.teacher_id),
                        course_id: parseInt(assignment.course_id),
                        semester: selectedCourseData.course_semester || 1,
                        academic_year: selectedCourseData.course_year || new Date().getFullYear(),
                        student_count: studentCount || 70,
                        is_assistant: assignment.is_assistant,
                        preferred_availability_slots: preferred_slots
                    });

                    successCount++;
                } catch (error: any) {
                    failureCount++;
                    const courseName = selectedCourseData.course_detail?.course_name || 'Unknown course';
                    let errorMessage = `Failed to assign to ${courseName}`;

                    if (error?.response?.data?.non_field_errors) {
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

                {/* Assignment Form */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-lg">Create Assignments</CardTitle>
                                    <CardDescription className="text-xs">Assign the selected teacher to courses</CardDescription>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={addAssignmentCard} 
                                    disabled={!selectedTeacher}
                                    className="h-8 text-xs"
                                >
                                    Add Course
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent >
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    {form.watch("assignments").map((assignment, index) => (
                                        <div key={index} className="border p-3 rounded-lg mb-3 relative">
                                            {index > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-1 right-1 text-red-500 hover:text-red-600 h-7 w-7 p-0"
                                                    onClick={() => removeAssignmentCard(index)}
                                                >
                                                    ×
                                                </Button>
                                            )}

                                            <div className="space-y-3 overflow-x-hidden">
                                                <FormField
                                                    control={form.control}
                                                    name={`assignments.${index}.course_id`}
                                                    render={({ field }) => (
                                                        <FormItem className="mb-1">
                                                            <FormLabel className="text-sm font-medium">Course {index + 1}</FormLabel>
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
                                                        <FormItem className="mb-1">
                                                            <FormLabel className="text-sm font-medium">Number of Students</FormLabel>
                                                            <div className="relative">
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        placeholder="Enter number of students"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                                        disabled={!selectedTeacher || coursesLoading || courseOptions.length === 0}
                                                                        className={field.value && deptStudentCount ? "pr-12" : ""}
                                                                    />
                                                                </FormControl>
                                                                {field.value > 0 && deptStudentCount && (
                                                                    <Badge 
                                                                        variant="outline" 
                                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-primary/5"
                                                                        title={`Based on ${deptStudentCount.department_name} department data`}
                                                                    >
                                                                        Dept. Validated
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            
                                            {/* Compact layout for assistant teacher option */}
                                            {assignment.show_assistant_option && (
                                                <FormField
                                                    control={form.control}
                                                    name={`assignments.${index}.is_assistant`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-2 mt-2">
                                                            <FormControl>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={field.value}
                                                                    onChange={field.onChange}
                                                                    className="rounded text-primary"
                                                                />
                                                            </FormControl>
                                                            <div className="space-y-0.5 leading-none">
                                                                <FormLabel className="text-sm">
                                                                    Assign as Assistant Teacher
                                                                </FormLabel>
                                                                <p className="text-xs text-muted-foreground">
                                                                    This course requires or allows assistant teachers
                                                                </p>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            {/* Compact layout for availability slots */}
                                            {isPOPOrIndustry && hasLimitedAvailability && sortedAvailability.length > 0 && (
                                                <FormField
                                                    control={form.control}
                                                    name={`assignments.${index}.preferred_availability_slots`}
                                                    render={({ field }) => (
                                                        <FormItem className="mt-2">
                                                            <FormLabel className="text-sm font-medium">Preferred Availability Slots</FormLabel>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 text-xs">
                                                                {sortedAvailability.map((slot) => (
                                                                    <div key={slot.id} className="flex items-center space-x-1 bg-muted/20 p-1 rounded">
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
                                                                            className="rounded text-primary h-3 w-3"
                                                                        />
                                                                        <label htmlFor={`slot-${slot.id}-${index}`} className="text-xs">
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

                                    <div className="flex justify-end mt-3">
                                        <Button
                                            type="submit"
                                            disabled={!selectedTeacher || createAssignment.isPending}
                                            className="h-9"
                                        >
                                            {createAssignment.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                            Create Assignments
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Course Statistics for Selected Courses - Moved below the form */}
            {selectedCourses.length > 0 && (
                <Card className="mt-8">
                    <CardHeader className="py-3">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base">Selected Course Statistics</CardTitle>
                            <Badge variant="outline" className="ml-2">
                                {selectedCourses.length} {selectedCourses.length === 1 ? 'course' : 'courses'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCourses.map(courseId => {
                                const courseData = courses.find(c => c.id.toString() === courseId);
                                if (!courseData) return null;

                                const studentCount = getStudentCountForCourse(courseId);
                                const requiredTeachers = calculateRequiredTeachers(studentCount);

                                // Find current teacher assignments for this course
                                const courseAssignments = assignments.filter(
                                    a => a.course_detail?.id.toString() === courseId
                                );

                                // Calculate LTP hours
                                const lHours = courseData.lecture_hours || 0;
                                const tHours = courseData.tutorial_hours || 0;
                                const pHours = courseData.practical_hours || 0;
                                const totalHours = calculateLTPHours(courseData);

                                return (
                                    <div key={courseId} className="border rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{courseData.course_detail?.course_name}</h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {courseData.course_detail?.course_id}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                                    <Badge variant="secondary" className="text-xs">
                                                        Year {courseData.course_year}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                        Sem {courseData.course_semester}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs bg-primary/5">
                                                        L:{lHours} T:{tHours} P:{pHours} ({totalHours}h)
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        For: {courseData.for_dept_detail.dept_name}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Badge variant={courseAssignments.length >= requiredTeachers ? "outline" : "destructive"} className="ml-2">
                                                {courseAssignments.length}/{requiredTeachers} teachers
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div className="bg-secondary/10 p-2 rounded-md flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs text-muted-foreground">Teachers</div>
                                                    <div className="font-medium">{courseAssignments.length}</div>
                                                </div>
                                                <div className={courseAssignments.length >= requiredTeachers ? "text-green-600 text-xs" : "text-red-600 text-xs"}>
                                                    {courseAssignments.length >= requiredTeachers ? "Adequate" : "Need more"}
                                                </div>
                                            </div>
                                            <div className="bg-secondary/10 p-2 rounded-md">
                                                <div className="text-xs text-muted-foreground">Students</div>
                                                <div className="font-medium">{studentCount}</div>
                                                {deptStudentCount && courseData.for_dept_id === deptStudentCount.department_id && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {getYearStudentCount(deptStudentCount, courseData.course_year) > 0 
                                                            ? `Based on Year ${courseData.course_year} data` 
                                                            : "Based on dept. estimate"}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {courseAssignments.length > 0 && (
                                            <div className="mt-2 text-xs">
                                                <div className="font-medium mb-1">Current Assignments</div>
                                                <div className="border rounded overflow-hidden">
                                                    <div className="grid grid-cols-3 bg-muted/30 p-1">
                                                        <div className="font-medium">Teacher</div>
                                                        <div className="font-medium text-center">Role</div>
                                                        <div className="font-medium text-right">Students</div>
                                                    </div>
                                                    {courseAssignments.map(assignment => (
                                                        <div key={assignment.id} className="grid grid-cols-3 p-1 border-t">
                                                            <div className="truncate">
                                                                {assignment.teacher_detail?.teacher_id?.first_name} {assignment.teacher_detail?.teacher_id?.last_name}
                                                            </div>
                                                            <div className="text-center">
                                                                <Badge variant={assignment.is_assistant ? "outline" : "default"} className="text-xs">
                                                                    {assignment.is_assistant ? "Assistant" : "Primary"}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-right">
                                                                {assignment.student_count || 0}
                                                            </div>
                                                        </div>
                                                    ))}
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
        </div>
    );
} 