import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useGetTeachers } from '@/action/teacher';
import { useGetCourses } from '@/action/course';
import { useGetTeacherCourseAssignments, useCreateTeacherCourseAssignment, useDeleteTeacherCourseAssignment, TeacherCourseAssignment as TCAssignment } from '@/action/teacherCourse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Eye, Search, X, Filter, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Teacher } from '@/action/teacher';
import type { Course } from '@/action/course';

export function TeacherCourseAssignment() {
    const navigate = useNavigate();
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [semester, setSemester] = useState<string>('');
    const [academicYear, setAcademicYear] = useState<string>('');
    const [studentCount, setStudentCount] = useState<string>('0');
    const [assignmentToDelete, setAssignmentToDelete] = useState<TCAssignment | null>(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string[]>([]);
    const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string[]>([]);
    const [selectedAcademicYearFilter, setSelectedAcademicYearFilter] = useState<string[]>([]);
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string[]>([]);

    // Fetch data with loading states
    const { data: teachers = [], isPending: teachersLoading } = useGetTeachers();
    const { data: courses = [], isPending: coursesLoading } = useGetCourses();
    const { 
        data: assignments = [], 
        isPending: assignmentsLoading, 
        refetch: refetchAssignments 
    } = useGetTeacherCourseAssignments();
    console.log(assignments);

    // Create assignment mutation
    const createAssignment = useCreateTeacherCourseAssignment(() => {
        toast.success('Teacher course assignment created successfully');
        refetchAssignments();
        resetForm();
    });

    // Delete assignment mutation
    const deleteAssignment = useDeleteTeacherCourseAssignment(() => {
        toast.success('Teacher course assignment deleted successfully');
        refetchAssignments();
    });

    // Reset form after successful submission
    const resetForm = () => {
        setSelectedTeacher('');
        setSelectedCourse('');
        setSemester('');
        setAcademicYear('');
        setStudentCount('0');
    };

    // Extract unique values for filters
    const uniqueSemesters = useMemo(() => {
        return Array.from(new Set(assignments.map(a => a.semester.toString())));
    }, [assignments]);

    const uniqueAcademicYears = useMemo(() => {
        return Array.from(new Set(assignments.map(a => a.academic_year.toString())));
    }, [assignments]);

    const uniqueDepartments = useMemo(() => {
        return Array.from(new Set(assignments.map(a => a.course_detail?.department_name || '')));
    }, [assignments]);

    // Get unique teacher names for filter
    const uniqueTeachers = useMemo(() => {
        return Array.from(
            new Set(
                assignments.map(
                    a => `${a.teacher_detail.teacher.first_name} ${a.teacher_detail.teacher.last_name}`
                )
            )
        );
    }, [assignments]);

    // Filter assignments based on search query and selected filters
    const filteredAssignments = useMemo(() => {
        return assignments.filter(assignment => {
            // Apply search query
            const teacherName = `${assignment.teacher_detail.teacher.first_name} ${assignment.teacher_detail.teacher.last_name}`.toLowerCase();
            const courseName = assignment.course_detail.course_name.toLowerCase();
            const courseCode = assignment.course_detail.course_code.toLowerCase();
            const searchLower = searchQuery.toLowerCase();
            
            const matchesSearch = searchQuery === '' || 
                teacherName.includes(searchLower) || 
                courseName.includes(searchLower) || 
                courseCode.includes(searchLower);
            
            // Apply filters
            const matchesSemester = selectedSemesterFilter.length === 0 || 
                selectedSemesterFilter.includes(assignment.semester.toString());
            
            const matchesAcademicYear = selectedAcademicYearFilter.length === 0 || 
                selectedAcademicYearFilter.includes(assignment.academic_year.toString());
            
            const matchesDepartment = selectedDepartmentFilter.length === 0 || 
                selectedDepartmentFilter.includes(assignment.course_detail.department_name);
            
            const matchesTeacher = selectedTeacherFilter.length === 0 || 
                selectedTeacherFilter.includes(`${assignment.teacher_detail.teacher.first_name} ${assignment.teacher_detail.teacher.last_name}`);
            
            return matchesSearch && matchesSemester && matchesAcademicYear && matchesDepartment && matchesTeacher;
        });
    }, [assignments, searchQuery, selectedSemesterFilter, selectedAcademicYearFilter, selectedDepartmentFilter, selectedTeacherFilter]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacher || !selectedCourse || !semester || !academicYear) {
            toast.error('Please fill all required fields');
            return;
        }

        createAssignment.mutate({
            teacher: parseInt(selectedTeacher),
            course: parseInt(selectedCourse),
            semester: parseInt(semester),
            academic_year: parseInt(academicYear),
            student_count: parseInt(studentCount)
        });
    };

    const handleDelete = () => {
        if (!assignmentToDelete) return;
        
        deleteAssignment.mutate(assignmentToDelete.id, {
            onSuccess: () => {
                toast.success('Assignment deleted successfully');
                refetchAssignments();
                setAssignmentToDelete(null);
            },
            onError: (error: any) => {
                toast.error('Failed to delete assignment', {
                    description: error.message
                });
                setAssignmentToDelete(null);
            }
        });
    };

    const viewDetails = (id: number) => {
        navigate(`/teacher-course-assignment/${id}`);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSemesterFilter([]);
        setSelectedAcademicYearFilter([]);
        setSelectedDepartmentFilter([]);
        setSelectedTeacherFilter([]);
    };

    // Function to export assignments as CSV
    const exportToCSV = () => {
        const headers = ['Teacher', 'Course', 'Course Code', 'Department', 'Semester', 'Academic Year', 'Student Count'];
        
        const csvRows = [
            headers.join(','),
            ...filteredAssignments.map(a => [
                `"${a.teacher_detail.teacher.first_name} ${a.teacher_detail.teacher.last_name}"`,
                `"${a.course_detail.course_name}"`,
                `"${a.course_detail.course_code}"`,
                `"${a.course_detail.department_name}"`,
                a.semester,
                a.academic_year,
                a.student_count || 0
            ].join(','))
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `teacher-course-assignments-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container mx-auto px-4 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Teacher Course Assignment</CardTitle>
                    <CardDescription>Assign teachers to courses for specific semesters and academic years</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="teacher">Teacher</Label>
                                <Select 
                                    value={selectedTeacher} 
                                    onValueChange={setSelectedTeacher}
                                    disabled={teachersLoading || createAssignment.isPending}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={teachersLoading ? "Loading teachers..." : "Select a teacher"} />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.map((teacher: Teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                        {teacher.teacher.first_name} {teacher.teacher.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                            <div className="space-y-2">
                                <Label htmlFor="course">Course</Label>
                                <Select 
                                    value={selectedCourse} 
                                    onValueChange={setSelectedCourse}
                                    disabled={coursesLoading || createAssignment.isPending}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course"} />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course: Course) => (
                                    <SelectItem key={course.id} value={course.id.toString()}>
                                        {course.course_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                            <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                                <Select value={semester} onValueChange={setSemester} disabled={createAssignment.isPending}>
                                    <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
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
                            placeholder="Enter academic year"
                                    disabled={createAssignment.isPending}
                                    min={2000}
                                    max={2099}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="studentCount">Student Count</Label>
                                <Input
                                    type="number"
                                    id="studentCount"
                                    value={studentCount}
                                    onChange={(e) => setStudentCount(e.target.value)}
                                    placeholder="Number of students"
                                    disabled={createAssignment.isPending}
                                    min={0}
                        />
                    </div>
                </div>

                        <Button 
                            type="submit" 
                            className="mt-4"
                            disabled={createAssignment.isPending}
                        >
                            {createAssignment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                </Button>
            </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Current Assignments</CardTitle>
                            <CardDescription>List of all teacher course assignments</CardDescription>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={exportToCSV}
                            disabled={filteredAssignments.length === 0}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export as CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3 justify-between">
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search assignments..."
                                    className="pl-8 w-full sm:w-[300px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />  
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Teacher
                                            {selectedTeacherFilter.length > 0 && (
                                                <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                                                    {selectedTeacherFilter.length}
                                                </Badge>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        {uniqueTeachers.map((teacherName: string) => (
                                            <DropdownMenuItem key={teacherName} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`teacher-${teacherName}`}
                                                    checked={selectedTeacherFilter.includes(teacherName)}
                                                    onCheckedChange={(checked: boolean) => {
                                                        if (checked) {
                                                            setSelectedTeacherFilter(prev => [...prev, teacherName]);
                                                        } else {
                                                            setSelectedTeacherFilter(prev => prev.filter(t => t !== teacherName));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`teacher-${teacherName}`} className="flex-1 cursor-pointer">
                                                    {teacherName}
                                                </label>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Semester
                                            {selectedSemesterFilter.length > 0 && (
                                                <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                                                    {selectedSemesterFilter.length}
                                                </Badge>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {uniqueSemesters.map((sem: string) => (
                                            <DropdownMenuItem key={sem} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`semester-${sem}`}
                                                    checked={selectedSemesterFilter.includes(sem)}
                                                    onCheckedChange={(checked: boolean) => {
                                                        if (checked) {
                                                            setSelectedSemesterFilter(prev => [...prev, sem]);
                                                        } else {
                                                            setSelectedSemesterFilter(prev => prev.filter(s => s !== sem));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`semester-${sem}`} className="flex-1 cursor-pointer">
                                                    Semester {sem}
                                                </label>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Academic Year
                                            {selectedAcademicYearFilter.length > 0 && (
                                                <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                                                    {selectedAcademicYearFilter.length}
                                                </Badge>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {uniqueAcademicYears.map((year: string) => (
                                            <DropdownMenuItem key={year} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`year-${year}`}
                                                    checked={selectedAcademicYearFilter.includes(year)}
                                                    onCheckedChange={(checked: boolean) => {
                                                        if (checked) {
                                                            setSelectedAcademicYearFilter(prev => [...prev, year]);
                                                        } else {
                                                            setSelectedAcademicYearFilter(prev => prev.filter(y => y !== year));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`year-${year}`} className="flex-1 cursor-pointer">
                                                    {year}
                                                </label>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9">
                                            <Filter className="mr-2 h-4 w-4" />
                                            Department
                                            {selectedDepartmentFilter.length > 0 && (
                                                <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                                                    {selectedDepartmentFilter.length}
                                                </Badge>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {uniqueDepartments.map((dept: string) => dept && (
                                            <DropdownMenuItem key={dept} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`dept-${dept}`}
                                                    checked={selectedDepartmentFilter.includes(dept)}
                                                    onCheckedChange={(checked: boolean) => {
                                                        if (checked) {
                                                            setSelectedDepartmentFilter(prev => [...prev, dept]);
                                                        } else {
                                                            setSelectedDepartmentFilter(prev => prev.filter(d => d !== dept));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`dept-${dept}`} className="flex-1 cursor-pointer">
                                                    {dept}
                                                </label>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {(searchQuery || selectedSemesterFilter.length > 0 || 
                                  selectedAcademicYearFilter.length > 0 || selectedDepartmentFilter.length > 0 ||
                                  selectedTeacherFilter.length > 0) && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-9"
                                        onClick={clearFilters}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>

                        {assignmentsLoading ? (
                            <div className="flex justify-center items-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                {filteredAssignments.length === 0 ? (
                                    <div className="text-center py-12 border rounded-md">
                                        <p className="text-muted-foreground">
                                            {assignments.length === 0 
                                                ? "No assignments found. Create your first assignment above." 
                                                : "No assignments match your search criteria."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Course</TableHead>
                                                    <TableHead>Department</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead>Academic Year</TableHead>
                                                    <TableHead>Student Count</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                                                {filteredAssignments.map((assignment: TCAssignment) => (
                                                    <TableRow key={assignment.id} className="cursor-pointer hover:bg-muted/50">
                                                        <TableCell className="font-medium">
                                                            <Button variant="link" className="p-0 h-auto" onClick={() => viewDetails(assignment.id)}>
                                                                {assignment.teacher_detail.teacher.first_name} {assignment.teacher_detail.teacher.last_name}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="link" className="p-0 h-auto" onClick={() => viewDetails(assignment.id)}>
                                                                {assignment.course_detail.course_name}
                                                            </Button>
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                {assignment.course_detail.course_code}
                                                            </div>
                                </TableCell>
                                    <TableCell>
                                                            <Badge variant="outline" className="font-normal">
                                                                {assignment.course_detail.department_name}
                                                            </Badge>
                                    </TableCell>
                                    <TableCell>{assignment.semester}</TableCell>
                                    <TableCell>{assignment.academic_year}</TableCell>
                                                        <TableCell>{assignment.student_count || 0}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        viewDetails(assignment.id);
                                                                    }}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    <span className="sr-only">View details</span>
                                                                </Button>
                                        <Button
                                            variant="destructive"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setAssignmentToDelete(assignment);
                                                                    }}
                                                                    disabled={deleteAssignment.isPending}
                                                                >
                                                                    {deleteAssignment.isPending && deleteAssignment.variables === assignment.id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-4 w-4" />
                                                                    )}
                                                                    <span className="sr-only">Delete</span>
                                        </Button>
                                                            </div>
                                    </TableCell>
                                </TableRow>
                                                ))}
                    </TableBody>
                </Table>
            </div>
                                )}
                                <div className="text-sm text-muted-foreground mt-2">
                                    Showing {filteredAssignments.length} of {assignments.length} assignments
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={!!assignmentToDelete} onOpenChange={(open) => !open && setAssignmentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the assignment for <span className="font-semibold">
                                {assignmentToDelete?.teacher_detail.teacher.first_name} {assignmentToDelete?.teacher_detail.teacher.last_name}
                            </span> to teach <span className="font-semibold">
                                {assignmentToDelete?.course_detail.course_name}
                            </span>?
                            <br /><br />
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleteAssignment.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 