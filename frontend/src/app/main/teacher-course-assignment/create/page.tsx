import React, { useState, useMemo, useEffect } from 'react';
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
  assignments: z.array(
    z.object({
      course_id: z.string().min(1, "Course is required"),
      no_of_students: z.number().min(1, "Number of students is required"),
      preferred_availability_slots: z.array(z.string()).optional(),
      is_assistant: z.boolean().default(false),
    })
  ).min(1, "At least one course assignment is required"),
});

type TeacherCourseFormValues = z.infer<typeof teacherCourseFormSchema>;

export default function CreateTeacherCourseAssignment() {
    const navigate = useNavigate();
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [showAssistantOption, setShowAssistantOption] = useState<boolean>(false);

    // Fetch data with loading states
    const { data: teachers = [], isPending: teachersLoading } = useGetTeachers();
    const { data: courses = [], isPending: coursesLoading } = useGetCourses();
    const { data: assignments = [], isPending: assignmentsLoading } = useGetTeacherCourseAssignments();

    // Fetch teacher availability if a teacher is selected
    const { data: teacherAvailability = [], isPending: availabilityLoading } =
        useGetTeacherAvailability(selectedTeacher ? parseInt(selectedTeacher) : 0);

    const STUDENT_COUNT_OPTIONS = [
        { value: 70, label: "70 students" },
        { value: 140, label: "140 students" },
        { value: 210, label: "210 students" },
        { value: 280, label: "280 students" }
    ];

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

    // Calculate required teachers based on student count (1 teacher per 70 students, max 5)
    // One teacher can handle up to 140 students (twice standard load) if needed
    const calculateRequiredTeachers = (studentCount: number) => {
        // First teacher can handle up to 140 students (twice regular load)
        if (studentCount <= 140) {
            return 1;
        }
        // For additional students beyond 140, add teachers at normal capacity (70 per teacher)
        const additionalStudents = studentCount - 140;
        const additionalTeachers = Math.ceil(additionalStudents / 70);
        const totalTeachers = 1 + additionalTeachers;

        return Math.min(totalTeachers, 5); // Cap at 5 teachers maximum
    };

    // Get course assignment stats
    const { data: courseStats, isPending: courseStatsLoading } = useGetCourseAssignmentStats(
        selectedCourse ? parseInt(selectedCourse) : undefined
    );

    // Find selected course data
    const selectedCourseData = useMemo(() => {
        if (!selectedCourse) return null;
        return courses.find((c: Course) => c.id.toString() === selectedCourse);
    }, [selectedCourse, courses]);

    // Check if course needs assistant teacher
    useEffect(() => {
        if (selectedCourseData && selectedCourseData.need_assist_teacher) {
            setShowAssistantOption(true);
        } else {
            setShowAssistantOption(false);
            // Update all assignments to set is_assistant to false
            const assignments = form.getValues("assignments");
            const updatedAssignments = assignments.map(assignment => ({
            ...assignment,
            is_assistant: false
            }));
            form.setValue("assignments", updatedAssignments);
        }
    }, [selectedCourseData, form]);

    const onSubmit = (data: TeacherCourseFormValues) => {
        // Validate all assignments before submitting
        const errors: string[] = [];
        
        data.assignments.forEach((assignment, index) => {
          const selectedCourseData = courses.find(c => c.id.toString() === assignment.course_id);
          if (!selectedCourseData) {
            errors.push(`Assignment ${index + 1}: Invalid course selected`);
            return;
          }
      
          // Check teacher workload for each assignment
          if (teacherWorkload && (teacherWorkload.availableHours < selectedCourseData.credits * data.assignments.length)) {
            errors.push(`Teacher does not have enough available hours for all assignments`);
          }
      
          // Check for duplicate course assignments
          const duplicate = data.assignments.find((a, i) => 
            a.course_id === assignment.course_id && i !== index
          );
          if (duplicate) {
            errors.push(`Course ${selectedCourseData.course_detail?.course_name} is assigned multiple times`);
          }
        });
      
        if (errors.length > 0) {
          toast.error('Validation errors', {
            description: errors.join('\n')
          });
          return;
        }
      
        // Create all assignments
        const promises = data.assignments.map(assignment => {
          const selectedCourseData = courses.find(c => c.id.toString() === assignment.course_id);
          if (!selectedCourseData) return Promise.reject("Invalid course");
      
          const preferred_slots = assignment.preferred_availability_slots?.map(id => parseInt(id)) || [];
      
          return createAssignment.mutateAsync({
            teacher_id: parseInt(data.teacher_id),
            course_id: parseInt(assignment.course_id),
            semester: 1,
            academic_year: new Date().getFullYear(),
            student_count: assignment.no_of_students,
            is_assistant: assignment.is_assistant,
            preferred_availability_slots: preferred_slots
          });
        });
      
        Promise.all(promises)
          .then(() => {
            toast.success('All assignments created successfully');
            navigate('/teacher-course-assignment');
          })
          .catch(error => {
            toast.error('Failed to create some assignments', {
              description: error.message || 'An error occurred'
            });
        });
    };

    // Update the selected s and course when form values change
    const handleTeacherChange = (value: string) => {
        setSelectedTeacher(value);
        form.setValue("teacher_id", value);
        
        // Clear all course selections when teacher changes
        const assignments = form.getValues("assignments");
        const clearedAssignments = assignments.map(assignment => ({
          ...assignment,
          course_id: "",
          preferred_availability_slots: [],
          is_assistant: false
        }));
        form.setValue("assignments", clearedAssignments);
        
        // Reset the selected course state
        setSelectedCourse('');
        setShowAssistantOption(false);
      };

    const handleCourseChange = (value: string, index: number) => {
        const assignments = form.watch("assignments");
        const newAssignments = [...assignments];
        newAssignments[index].course_id = value;
        form.setValue("assignments", newAssignments);
        
        // Update the selected course for stats display (show stats for the first course)
        if (index === 0) {
          setSelectedCourse(value);
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
                                    {showAssistantOption && (
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
                                                        : courseStats.teachers?.reduce((total: number, teacher: { student_count: number }) =>
                                                            total + (teacher.student_count || 0), 0) || 0}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Teacher requirements based on student count */}
                                        {!Array.isArray(courseStats) && courseStats?.teachers && (
                                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-medium">Teacher Requirements</p>
                                                    <Badge variant={
                                                        (courseStats.total_teachers || 0) >= calculateRequiredTeachers(104)
                                                            ? "outline" : "destructive"
                                                    }>
                                                        {courseStats.total_teachers || 0} / {calculateRequiredTeachers(104)} teachers
                                                    </Badge>
                                                </div>

                                                {selectedCourseData && (
                                                    <div className="mt-3 space-y-2">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium">Semester:</span>
                                                                    <Badge variant="secondary">{selectedCourseData.course_semester}</Badge>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-sm font-medium">Academic Year:</span>
                                                                    <Badge variant="secondary">{selectedCourseData.course_year}</Badge>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    <span className="font-medium">Total Students:</span> {courseStats.teachers?.reduce(
                                                                        (total: number, teacher: { student_count: number }) =>
                                                                            total + (teacher.student_count || 0), 0) || 0}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground mt-1">
                                                                    <span className="font-medium">Year {selectedCourseData.course_year} Students:</span> 104
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-sm bg-secondary/10 p-2 rounded">
                                                            {(courseStats.total_teachers || 0) >= calculateRequiredTeachers(104) ?
                                                                <span className="text-green-600 font-medium">Adequate</span> :
                                                                <span className="text-red-600 font-medium">Inadequate</span>} teacher staffing for this course.
                                                            <br />
                                                            {calculateRequiredTeachers(104) === 1 ? (
                                                                <span className="text-xs">This course has 104 students, which is within the capacity of a single teacher (up to 140 students).</span>
                                                            ) : (
                                                                <span className="text-xs">This course has 104 students, requiring {calculateRequiredTeachers(104)} teachers at standard capacity.</span>
                                                            )}
                                                            {courseStats.total_teachers > 0 && courseStats.total_teachers < calculateRequiredTeachers(104) && (
                                                                <span className="block mt-1 text-xs text-amber-600">
                                                                    Currently {courseStats.total_teachers} teacher(s) assigned. Need {calculateRequiredTeachers(104) - courseStats.total_teachers} more.
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

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
                                                                <TableHead>Role</TableHead>
                                                                <TableHead>Students</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {courseStats.teachers.map((teacher) => (
                                                                <TableRow key={teacher.assignment_id || teacher.teacher_id || 'unknown'}>
                                                                    <TableCell>
                                                                        <div className="font-medium">
                                                                            {teacher.teacher_name || 'Unknown Teacher'}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {teacher.is_assistant === true ?
                                                                            <Badge variant="outline">Assistant</Badge> :
                                                                            <Badge>Primary</Badge>
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>{teacher.student_count || 0}</TableCell>
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