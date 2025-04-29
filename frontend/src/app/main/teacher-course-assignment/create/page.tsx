import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useGetTeachers, Teacher, useGetTeacherAvailability, TeacherAvailability } from '@/action/teacher';
import { useGetCourses, Course } from '@/action/course';
import { useGetTeacherCourseAssignments, useCreateTeacherCourseAssignment } from '@/action/teacherCourse';
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
    course_id: z.string().min(1, "Course is required"),
    preferred_availability_slots: z.array(z.string()).optional(),
});

type TeacherCourseFormValues = z.infer<typeof teacherCourseFormSchema>;

export default function CreateTeacherCourseAssignment() {
    const navigate = useNavigate();
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');

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
            course_id: "",
            preferred_availability_slots: [],
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
            label: `${teacher.teacher_id?.first_name} ${teacher.teacher_id?.last_name} (${teacher.staff_code} - ${teacher.dept_id?.dept_name || 'No Department'})${teacher.is_industry_professional ? ' 🏢' : ''}`
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
    }, [selectedTeacher, assignments, selectedTeacherData]);

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

    // Transform filtered courses into combobox options
    const courseOptions: ComboboxOption[] = useMemo(() => {
        return availableCourses.map((course: Course) => ({
            value: course.id.toString(),
            label: `${course.course_detail?.course_name} (${course.course_detail?.course_id} ${course.id} - ${course.credits} credits)`
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

        // Error for industry professional/POP teacher without ANY defined availability slots
        if (isPOPOrIndustry && hasLimitedAvailability && sortedAvailability.length === 0) {
            toast.error('Industry professional/POP teachers must have defined availability slots', {
                description: 'Please define availability slots for this teacher before creating an assignment'
            });
            return;
        }

        // Warning for POP/industry professional without selected availability slots
        if (isPOPOrIndustry && hasLimitedAvailability && sortedAvailability.length > 0 && 
            (!data.preferred_availability_slots || data.preferred_availability_slots.length === 0)) {
            if (!confirm('This industry professional has availability slots defined but none selected. Continue anyway?')) {
                return;
            }
        }

        // Convert preferred_availability_slots to array of numbers for the API
        const preferred_slots = data.preferred_availability_slots?.map(id => parseInt(id)) || [];

        createAssignment.mutate({
            teacher_id: parseInt(data.teacher_id),
            course_id: parseInt(data.course_id),
            semester: 1, // Default value
            academic_year: new Date().getFullYear(), // Default current year
            student_count: 0, // Default value
            // @ts-ignore - API accepts this parameter but type definition hasn't been updated
            preferred_availability_slots: preferred_slots
        }, {
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
        // Clear preferred availability slots
        form.setValue("preferred_availability_slots", []);
    };

    const handleCourseChange = (value: string) => {
        setSelectedCourse(value);
        form.setValue("course_id", value);
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
                                                        value={field.value}
                                                        onValueChange={handleCourseChange}
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

                                    {/* Availability slots selection for industry professionals */}
                                    {isPOPOrIndustry && hasLimitedAvailability && sortedAvailability.length > 0 && (
                                        <FormField
                                            control={form.control}
                                            name="preferred_availability_slots"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Preferred Availability Slots</FormLabel>
                                                    <div className="space-y-2">
                                                        {sortedAvailability.map((slot) => (
                                                            <div key={slot.id} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`slot-${slot.id}`}
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
                                                                <label htmlFor={`slot-${slot.id}`} className="text-sm">
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

                                    <Button
                                        type="submit"
                                        disabled={!selectedTeacher || !selectedCourse || createAssignment.isPending}
                                        className="w-full mt-4"
                                    >
                                        {createAssignment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Assignment
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Course Stats Card */}
                    {selectedCourse && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Statistics</CardTitle>
                                <CardDescription>Current assignment statistics for this course</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {courseStatsLoading ? (
                                    <div className="flex justify-center my-6">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : courseStats ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-muted/20 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Assigned Teachers</p>
                                                <p className="text-2xl font-bold">
                                                    {Array.isArray(courseStats) 
                                                        ? 0 
                                                        : courseStats.total_teachers || 0}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-muted/20 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Total Students</p>
                                                <p className="text-2xl font-bold">
                                                    {Array.isArray(courseStats) 
                                                        ? 0 
                                                        : courseStats.teachers?.reduce((total: number, teacher: {student_count: number}) => 
                                                            total + (teacher.student_count || 0), 0) || 0}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium mb-2">Current Assignments</h4>
                                            {Array.isArray(courseStats) || !courseStats.teachers || courseStats.teachers.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No current assignments</p>
                                            ) : (
                                                <div className="border rounded-md overflow-hidden">
                                                    <Table>
                                                        <TableHeader className="bg-muted/30">
                                                            <TableRow>
                                                                <TableHead>Teacher</TableHead>
                                                                <TableHead>Students</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {courseStats.teachers.map((teacher: {
                                                                teacher_id: number;
                                                                teacher_name: string;
                                                                student_count: number;
                                                            }) => (
                                                                <TableRow key={teacher.teacher_id}>
                                                                    <TableCell>
                                                                        <div className="font-medium">
                                                                            {teacher.teacher_name}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>{teacher.student_count}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground">No statistics available</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 