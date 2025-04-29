import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useGetTeachers, Teacher } from '@/action/teacher';
import { useGetCourses, Course } from '@/action/course';
import { useGetTeacherCourseAssignments, useCreateTeacherCourseAssignment } from '@/action/teacherCourse';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Users, AlertTriangle, Briefcase, Clock } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the Zod schema for teacher course assignment
const teacherCourseFormSchema = z.object({
    teacher_id: z.string().min(1, "Teacher is required"),
    course_id: z.string().min(1, "Course is required"),
    // For industry professionals, we might need special schedules
    requires_special_scheduling: z.boolean().default(false),
});

type TeacherCourseFormValues = z.infer<typeof teacherCourseFormSchema>;

// Extend the Teacher type to include industry professional properties
interface ExtendedTeacher extends Teacher {
    is_industry_professional?: boolean;
    company_name?: string;
    availability_slots?: Array<{
        id: number;
        day_of_week: number;
        start_time: string;
        end_time: string;
    }>;
}

// Extend the teacher stats type
interface TeacherStats {
    teacher_id: number;
    teacher_name: string;
    semester: number;
    academic_year: number;
    student_count: number;
    is_industry_professional?: boolean;
}

// Helper component to display teacher availability
const TeacherAvailabilityDisplay = ({ teacher }: { teacher: ExtendedTeacher }) => {
    // This assumes we have availability information in the teacher object
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <h4 className="font-medium">Limited Availability Schedule</h4>
            </div>
            
            <div className="border rounded-md divide-y">
                {teacher.availability_slots && teacher.availability_slots.length > 0 ? (
                    teacher.availability_slots.map((slot, index) => (
                        <div key={index} className="p-2 flex justify-between items-center">
                            <div>
                                <span className="font-medium">{daysOfWeek[slot.day_of_week]}</span>
                            </div>
                            <div>
                                <span className="text-sm">{slot.start_time} - {slot.end_time}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-muted-foreground">
                        No availability schedule set for this industry professional
                    </div>
                )}
            </div>
        </div>
    );
};

// Extend the TeacherCourseAssignment type
interface TeacherCourseAssignmentExtended {
    teacher_id: number;
    course_id: number;
    semester?: number;
    academic_year?: number;
    student_count?: number;
    requires_special_scheduling?: boolean;
}

export default function CreateTeacherCourseAssignment() {
    const navigate = useNavigate();
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');

    // Fetch data with loading states
    const { data: teachers = [], isPending: teachersLoading } = useGetTeachers();
    const { data: courses = [], isPending: coursesLoading } = useGetCourses();
    const { data: assignments = [], isPending: assignmentsLoading } = useGetTeacherCourseAssignments();

    // Setup form with Zod validation
    const form = useForm<TeacherCourseFormValues>({
        resolver: zodResolver(teacherCourseFormSchema),
        defaultValues: {
            teacher_id: "",
            course_id: "",
            requires_special_scheduling: false,
        },
    });

    // Create assignment mutation
    const createAssignment = useCreateTeacherCourseAssignment(() => {
        toast.success('Teacher course assignment created successfully');
        navigate('/teacher-course-assignment');
    });

    // Transform teachers into combobox options
    const teacherOptions: ComboboxOption[] = useMemo(() => {
        return teachers.map((teacher: Teacher) => ({
            value: teacher.id.toString(),
            label: `${teacher.teacher_id?.first_name} ${teacher.teacher_id?.last_name} (${teacher.staff_code} - ${teacher.dept_id?.dept_name || 'No Department'})`
        }));
    }, [teachers]);
    
    // Get the selected teacher data
    const selectedTeacherData = useMemo(() => {
        if (!selectedTeacher) return null;
        return teachers.find((t: Teacher) => t.id.toString() === selectedTeacher) as ExtendedTeacher | null;
    }, [selectedTeacher, teachers]);

    // Check if the selected teacher is an industry professional
    const isIndustryProfessional = useMemo(() => {
        return selectedTeacherData?.is_industry_professional || false;
    }, [selectedTeacherData]);

    // Calculate teacher's current workload and availability
    const teacherWorkload = useMemo(() => {
        if (!selectedTeacher || !assignments) return null;

        const teacherAssignments = assignments.filter(
            a => a.teacher_detail?.id?.toString() === selectedTeacher
        );

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
    }, [selectedTeacher, assignments, teachers, selectedTeacherData]);

    // Filter available courses based on selected teacher's department
    const availableCourses = useMemo(() => {
        if (!selectedTeacher || !teachers || !courses) return [];

        if (!selectedTeacherData || !selectedTeacherData.dept_id) return [];

        // For industry professionals, we might show all courses as they can teach specialized courses
        // across departments
        if (isIndustryProfessional) {
            return courses;
        }

        // For regular faculty, only show courses from their department
        return courses.filter(course => 
            selectedTeacherData?.dept_id?.id && course.teaching_dept_id === selectedTeacherData.dept_id.id
        );
    }, [selectedTeacher, teachers, courses, selectedTeacherData, isIndustryProfessional]);

    // Transform filtered courses into combobox options
    const courseOptions: ComboboxOption[] = useMemo(() => {
        return availableCourses.map((course: Course) => ({
            value: course.id.toString(),
            label: `${course.course_detail?.course_name} (${course.course_detail?.course_id} - ${course.id} - ${course.credits} credits)`
        }));
    }, [availableCourses]);

    // Get course assignment stats
    const { data: courseStats, isPending: courseStatsLoading } = useGetCourseAssignmentStats(
        selectedCourse ? parseInt(selectedCourse) : undefined
    );

    const onSubmit = (data: TeacherCourseFormValues) => {
        const selectedCourseData = courses.find(c => c.id.toString() === data.course_id);
        if (!selectedCourseData) return;

        if (teacherWorkload && (teacherWorkload.availableHours < selectedCourseData.credits)) {
            toast.error('Teacher does not have enough available hours for this course');
            return;
        }

        // Check if this teacher is already assigned to this course
        const existingAssignment = assignments.find(a => 
            a.teacher_detail?.id?.toString() === data.teacher_id && 
            a.course_detail?.id?.toString() === data.course_id
        );

        if (existingAssignment) {
            toast.error('This teacher is already assigned to this course', {
                description: 'A teacher cannot be assigned to the same course multiple times'
            });
            return;
        }
        
        // If the teacher is an industry professional, ensure we're setting the special scheduling flag
        const requires_special_scheduling = isIndustryProfessional;

        // Prepare assignment data
        const assignmentData: TeacherCourseAssignmentExtended = {
            teacher_id: parseInt(data.teacher_id),
            course_id: parseInt(data.course_id),
            semester: 1, // Default value
            academic_year: new Date().getFullYear(), // Default current year
            student_count: 0, // Default value
        };

        // Only add the requires_special_scheduling if it's an industry professional
        if (isIndustryProfessional) {
            assignmentData.requires_special_scheduling = true;
        }

        createAssignment.mutate(assignmentData, {
            onSuccess: () => {
                if (isIndustryProfessional) {
                    toast.success('Assignment created successfully', {
                        description: 'Please configure special scheduling for this industry professional in the next step'
                    });
                    // Navigate to the special scheduling page for this assignment
                    // You would need to implement this page separately
                    // navigate(`/teacher-course-assignment/${result.id}/schedule`);
                } else {
                    toast.success('Teacher course assignment created successfully');
                    navigate('/teacher-course-assignment');
                }
            },
            onError: (error: any) => {
                const errorMessage = error.response?.data?.non_field_errors?.[0] || 
                                    error.response?.data?.detail || 
                                    'An error occurred';
                
                toast.error('Failed to create assignment', {
                    description: errorMessage
                });
            }
        });
    };

    // Update the selected teacher and course when form values change
    const handleTeacherChange = (value: string) => {
        setSelectedTeacher(value);
        form.setValue("teacher_id", value);
        // Clear course selection when teacher changes
        if (selectedCourse) {
            setSelectedCourse('');
            form.setValue("course_id", '');
        }
    };

    const handleCourseChange = (value: string) => {
        setSelectedCourse(value);
        form.setValue("course_id", value);
    };

    return (
        <div className="container mx-auto px-4 space-y-8">
            
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

                        {isIndustryProfessional && selectedTeacherData && (
                            <Alert className="bg-amber-50 border-amber-200">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <AlertTitle className="text-amber-700">Industry Professional</AlertTitle>
                                <AlertDescription className="text-amber-700">
                                    {selectedTeacherData.teacher_id?.first_name} is an industry professional from{' '}
                                    {selectedTeacherData.company_name || 'an external organization'} with limited availability.
                                </AlertDescription>
                            </Alert>
                        )}

                        {isIndustryProfessional && selectedTeacherData && (
                            <TeacherAvailabilityDisplay teacher={selectedTeacherData} />
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
                                            {teacherWorkload.assignments.map(assignment => (
                                                <div key={assignment.id} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                                                    <div>
                                                        <p className="font-medium">{assignment.course_detail?.course_detail?.course_name}</p>
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
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="course_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Course</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={courseOptions}
                                                        value={selectedCourse}
                                                        onValueChange={handleCourseChange}
                                                        placeholder={!selectedTeacher ? "Select a teacher first" : coursesLoading ? "Loading courses..." : "Search for a course"}
                                                        searchPlaceholder="Search by name or code..."
                                                        emptyMessage={!selectedTeacher ? "Please select a teacher first" : "No courses found for this teacher's department"}
                                                        disabled={!selectedTeacher || coursesLoading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {isIndustryProfessional && selectedTeacher && selectedCourse && (
                                        <Alert>
                                            <Briefcase className="h-4 w-4" />
                                            <AlertTitle>Special Scheduling Required</AlertTitle>
                                            <AlertDescription>
                                                After creating this assignment, you'll need to set up the specific days and times 
                                                when this industry professional will teach this course.
                                            </AlertDescription>
                                        </Alert>
                                    )}

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
                            </Form>
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
                                                            <TableHead>Type</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {courseStats.teachers.map((teacher: TeacherStats) => (
                                                            <TableRow key={teacher.teacher_id}>
                                                                <TableCell>{teacher.teacher_name}</TableCell>
                                                                <TableCell>
                                                                    {teacher.is_industry_professional ? (
                                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                                                            Industry Professional
                                                                        </Badge>
                                                                    ) : 'Regular Faculty'}
                                                                </TableCell>
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