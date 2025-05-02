import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useGetTeacherCourseAssignments, useDeleteTeacherCourseAssignment, TeacherCourseAssignment as TCAssignment } from '@/action/teacherCourse';
import { useGetStudentStats } from '@/action/student';
import { useGetCourseAssignmentStats } from '@/action/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Eye, Search, X, Filter, Download, Plus } from 'lucide-react';
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


export function TeacherCourseAssignment() {
    const navigate = useNavigate();
    const [assignmentToDelete, setAssignmentToDelete] = useState<TCAssignment | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string[]>([]);
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string[]>([]);
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string[]>([]);
    const [selectedCourseCodeFilter, setSelectedCourseCodeFilter] = useState<string[]>([]);
    const [showIndustryOnly, setShowIndustryOnly] = useState<boolean>(false);
    const [showPOPOnly, setShowPOPOnly] = useState<boolean>(false);
    const [teacherRoleFilter, setTeacherRoleFilter] = useState<string | null>(null); // 'primary', 'assistant', or null

    // Get student statistics
    const { data: studentStats } = useGetStudentStats();

    // Get course assignment statistics
    const { data: courseStats, isPending: courseStatsLoading } = useGetCourseAssignmentStats(
        selectedCourseId || undefined
    );

    const {
        data: assignments = [],
        isPending: assignmentsLoading,
        refetch: refetchAssignments
    } = useGetTeacherCourseAssignments();

    // Delete assignment mutation
    const deleteAssignment = useDeleteTeacherCourseAssignment(() => {
        refetchAssignments();
    });

    // Get unique teacher names for filter
    const uniqueTeachers = useMemo(() => {
        return Array.from(
            new Set(
                assignments.filter(a => a.teacher_detail?.teacher_id)
                    .map(a => `${a.teacher_detail?.teacher_id?.first_name || ''} ${a.teacher_detail?.teacher_id?.last_name || ''}`.trim())
                    .filter(name => name !== '')
            )
        );
    }, [assignments]);

    // Get unique course/subject names for filter
    const uniqueSubjects = useMemo(() => {
        return Array.from(
            new Set(
                assignments.filter(a => a.course_detail?.course_detail?.course_name)
                    .map(a => a.course_detail?.course_detail?.course_name?.trim())
                    .filter(Boolean)
            )
        ).sort();
    }, [assignments]);

    // Get unique course codes for filter
    const uniqueCourseCodes = useMemo(() => {
        return Array.from(
            new Set(
                assignments.filter(a => a.course_detail?.course_detail?.course_id)
                    .map(a => a.course_detail?.course_detail?.course_id?.trim())
                    .filter(Boolean)
            )
        ).sort();
    }, [assignments]);

    // Filter assignments based on search query and selected filters
    const filteredAssignments = useMemo(() => {
        return assignments.filter(assignment => {
            // Apply search query
            const teacherName = assignment.teacher_detail?.teacher_id ?
                `${assignment.teacher_detail.teacher_id.first_name || ''} ${assignment.teacher_detail.teacher_id.last_name || ''}`.toLowerCase() : '';
            const courseName = assignment.course_detail?.course_detail?.course_name?.toLowerCase() || '';
            const courseCode = assignment.course_detail?.course_detail?.course_id?.toLowerCase() || '';
            const searchLower = searchQuery.toLowerCase();

            const matchesSearch = searchQuery === '' ||
                teacherName.includes(searchLower) ||
                courseName.includes(searchLower) ||
                courseCode.includes(searchLower);

            const matchesDepartment = selectedDepartmentFilter.length === 0 ||
                selectedDepartmentFilter.includes(assignment.course_detail?.teaching_dept_detail?.dept_name || '');

            const matchesTeacher = selectedTeacherFilter.length === 0 ||
                (assignment.teacher_detail?.teacher_id && selectedTeacherFilter.includes(
                    `${assignment.teacher_detail.teacher_id.first_name || ''} ${assignment.teacher_detail.teacher_id.last_name || ''}`.trim()
                ));

            const matchesSubject = selectedSubjectFilter.length === 0 ||
                (assignment.course_detail?.course_detail?.course_name &&
                    selectedSubjectFilter.includes(assignment.course_detail?.course_detail?.course_name));

            const matchesCourseCode = selectedCourseCodeFilter.length === 0 ||
                (assignment.course_detail?.course_detail?.course_id &&
                    selectedCourseCodeFilter.includes(assignment.course_detail?.course_detail?.course_id));

            const matchesIndustryFilter = !showIndustryOnly ||
                assignment.teacher_detail?.is_industry_professional === true;

            const matchesPOPFilter = !showPOPOnly ||
                assignment.teacher_detail?.teacher_role === 'POP';

            const matchesRoleFilter = !teacherRoleFilter ||
                (teacherRoleFilter === 'assistant' && assignment.is_assistant === true) ||
                (teacherRoleFilter === 'primary' && (assignment.is_assistant === false || assignment.is_assistant === undefined));

            return matchesSearch && matchesDepartment && matchesTeacher && matchesSubject && matchesCourseCode &&
                matchesIndustryFilter && matchesPOPFilter && matchesRoleFilter;
        });
    }, [assignments, searchQuery, selectedDepartmentFilter, selectedTeacherFilter, selectedSubjectFilter,
        selectedCourseCodeFilter, showIndustryOnly, showPOPOnly, teacherRoleFilter]);

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
        setSelectedTeacherFilter([]);
        setSelectedDepartmentFilter([]);
        setSelectedSubjectFilter([]);
        setSelectedCourseCodeFilter([]);
        setShowIndustryOnly(false);
        setShowPOPOnly(false);
        setTeacherRoleFilter(null);
    };

    // Function to export assignments as CSV
    const exportToCSV = () => {
        const headers = ['Teacher', 'Course', 'Course Code', 'Department', 'Role', 'Students'];

        const csvRows = [
            headers.join(','),
            ...filteredAssignments.map(a => [
                `"${a.teacher_detail?.teacher_id?.first_name || ''} ${a.teacher_detail?.teacher_id?.last_name || ''}"`,
                `"${a.course_detail?.course_detail?.course_name || ''}"`,
                `"${a.course_detail?.course_detail?.course_id || ''}"`,
                `"${a.course_detail?.teaching_dept_detail?.dept_name || ''}"`,
                `"${a.is_assistant ? 'Assistant' : 'Primary'}"`,
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

    const calculateRequiredTeachers = (studentCount: number) => {
        if (studentCount <= 140) {
            return 1; // One teacher can handle up to 140 students
        }
        const additionalStudents = studentCount - 140;
        const additionalTeachers = Math.ceil(additionalStudents / 70);
        const totalTeachers = 1 + additionalTeachers;

        return Math.min(totalTeachers, 5); // Cap at 5 teachers maximum
    };

        const handleCourseSelect = (courseId: number) => {
        setSelectedCourseId(courseId === selectedCourseId ? null : courseId);
    };

    return (
        <div className="mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Teacher Course Assignments</CardTitle>
                            <CardDescription>View and manage teacher course assignments</CardDescription>
                        </div>
                        <Button onClick={() => navigate('/teacher-course-assignment/create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Assignment
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search and Filters */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search assignments..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Button variant="outline" onClick={exportToCSV}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Teachers
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    {uniqueTeachers.map(teacher => (
                                        <DropdownMenuItem key={teacher}>
                                            <Checkbox
                                                id={teacher}
                                                checked={selectedTeacherFilter.includes(teacher)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedTeacherFilter([...selectedTeacherFilter, teacher]);
                                                    } else {
                                                        setSelectedTeacherFilter(selectedTeacherFilter.filter(t => t !== teacher));
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            <Label htmlFor={teacher}>{teacher}</Label>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Subjects
                                        {selectedSubjectFilter.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {selectedSubjectFilter.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 max-h-80 overflow-auto">
                                    {uniqueSubjects.map(subject => (
                                        subject && (
                                            <DropdownMenuItem key={subject}>
                                                <Checkbox
                                                    id={`subject-${subject}`}
                                                    checked={selectedSubjectFilter.includes(subject)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedSubjectFilter([...selectedSubjectFilter, subject]);
                                                        } else {
                                                            setSelectedSubjectFilter(selectedSubjectFilter.filter(s => s !== subject));
                                                        }
                                                    }}
                                                    className="mr-2"
                                                />
                                                <Label htmlFor={`subject-${subject}`} className="line-clamp-1 flex-1">
                                                    {subject}
                                                </Label>
                                            </DropdownMenuItem>
                                        )
                                    ))}
                                    {selectedSubjectFilter.length > 0 && (
                                        <DropdownMenuItem onClick={() => setSelectedSubjectFilter([])}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Subject Filters
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Course Codes
                                        {selectedCourseCodeFilter.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {selectedCourseCodeFilter.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 max-h-80 overflow-auto">
                                    {uniqueCourseCodes.map(code => (
                                        code && (
                                            <DropdownMenuItem key={code}>
                                                <Checkbox
                                                    id={`code-${code}`}
                                                    checked={selectedCourseCodeFilter.includes(code)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedCourseCodeFilter([...selectedCourseCodeFilter, code]);
                                                        } else {
                                                            setSelectedCourseCodeFilter(selectedCourseCodeFilter.filter(c => c !== code));
                                                        }
                                                    }}
                                                    className="mr-2"
                                                />
                                                <Label htmlFor={`code-${code}`} className="font-mono">
                                                    {code}
                                                </Label>
                                            </DropdownMenuItem>
                                        )
                                    ))}
                                    {selectedCourseCodeFilter.length > 0 && (
                                        <DropdownMenuItem onClick={() => setSelectedCourseCodeFilter([])}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Code Filters
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Department
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    {Array.from(new Set(assignments.map(a => a.course_detail?.teaching_dept_detail?.dept_name))).map(dept => (
                                        dept && (
                                            <DropdownMenuItem key={dept}>
                                                <Checkbox
                                                    id={`dept-${dept}`}
                                                    checked={selectedDepartmentFilter.includes(dept)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedDepartmentFilter([...selectedDepartmentFilter, dept]);
                                                        } else {
                                                            setSelectedDepartmentFilter(selectedDepartmentFilter.filter(d => d !== dept));
                                                        }
                                                    }}
                                                    className="mr-2"
                                                />
                                                <Label htmlFor={`dept-${dept}`}>{dept}</Label>
                                            </DropdownMenuItem>
                                        )
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={teacherRoleFilter ? "default" : "outline"}>
                                        <Filter className="mr-2 h-4 w-4" />
                                        Role
                                        {teacherRoleFilter && (
                                            <Badge variant="secondary" className="ml-2">
                                                {teacherRoleFilter === 'primary' ? 'Primary' : 'Assistant'}
                                            </Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuItem onClick={() => setTeacherRoleFilter('primary')}>
                                        <Checkbox
                                            id="primary-role"
                                            checked={teacherRoleFilter === 'primary'}
                                            className="mr-2"
                                        />
                                        <Label htmlFor="primary-role">Primary Teachers</Label>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTeacherRoleFilter('assistant')}>
                                        <Checkbox
                                            id="assistant-role"
                                            checked={teacherRoleFilter === 'assistant'}
                                            className="mr-2"
                                        />
                                        <Label htmlFor="assistant-role">Assistant Teachers</Label>
                                    </DropdownMenuItem>
                                    {teacherRoleFilter && (
                                        <DropdownMenuItem onClick={() => setTeacherRoleFilter(null)}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Role Filter
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant={showIndustryOnly ? "default" : "outline"}
                                onClick={() => setShowIndustryOnly(!showIndustryOnly)}
                                className="gap-2"
                            >
                                <span>🏢</span> Industry Professionals
                                {showIndustryOnly && <Badge variant="secondary" className="ml-1">Active</Badge>}
                            </Button>

                            <Button
                                variant={showPOPOnly ? "default" : "outline"}
                                onClick={() => setShowPOPOnly(!showPOPOnly)}
                                className="gap-2"
                            >
                                POP Teachers
                                {showPOPOnly && <Badge variant="secondary" className="ml-1">Active</Badge>}
                            </Button>

                            {(searchQuery || selectedTeacherFilter.length > 0 || selectedDepartmentFilter.length > 0 ||
                                selectedSubjectFilter.length > 0 || selectedCourseCodeFilter.length > 0 ||
                                showIndustryOnly || showPOPOnly || teacherRoleFilter) && (
                                    <Button variant="ghost" onClick={clearFilters} className="ml-auto">
                                        <X className="mr-2 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                        </div>
                    </div>

                    {/* Course Statistics Section */}
                    {selectedCourseId && (
                        <Card className="mb-6 border border-primary/20">
                            <CardHeader className="bg-primary/5 pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-md">
                                        Course Statistics
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedCourseId(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {courseStatsLoading ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : courseStats && !Array.isArray(courseStats) ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-secondary/10 p-3 rounded-md">
                                                <div className="text-sm text-muted-foreground">Course</div>
                                                <div className="font-medium">{courseStats.course_name}</div>
                                                <div className="text-xs font-mono">{courseStats.course_code}</div>
                                            </div>

                                            {/* Student count from the course */}
                                            <div className="bg-secondary/10 p-3 rounded-md">
                                                <div className="text-sm text-muted-foreground">Total Students</div>
                                                <div className="font-medium text-xl">
                                                    {courseStats.teachers.reduce((sum, t) => sum + (t.student_count || 0), 0)}
                                                </div>
                                            </div>

                                            {/* Teacher requirements */}
                                            <div className="bg-secondary/10 p-3 rounded-md">
                                                <div className="text-sm text-muted-foreground">Teacher Requirements</div>
                                                <div className="flex items-end gap-1">
                                                    <div className="font-medium text-xl">
                                                        {courseStats.total_teachers} / {calculateRequiredTeachers(
                                                            courseStats.teachers.reduce((sum, t) => sum + (t.student_count || 0), 0)
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground ml-1 mb-0.5">
                                                        teachers assigned
                                                    </div>
                                                </div>
                                                {courseStats.total_teachers < calculateRequiredTeachers(
                                                    courseStats.teachers.reduce((sum, t) => sum + (t.student_count || 0), 0)
                                                ) ? (
                                                    <Badge variant="destructive" className="mt-1">
                                                        Requires {calculateRequiredTeachers(
                                                            courseStats.teachers.reduce((sum, t) => sum + (t.student_count || 0), 0)
                                                        ) - courseStats.total_teachers} more teachers
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="mt-1 bg-green-50">
                                                        Sufficient teachers
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Year-specific student count comparison */}
                                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-sm font-medium">Teacher Requirements</h4>
                                                <Badge variant={
                                                    (courseStats.total_teachers >= calculateRequiredTeachers(104)) ?
                                                        "outline" : "destructive"
                                                }>
                                                    {courseStats.total_teachers} / {calculateRequiredTeachers(104)} teachers
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <div className="text-sm text-muted-foreground mb-1">
                                                        <span className="font-medium">Semester:</span> {courseStats.teachers[0]?.semester || "-"}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mb-1">
                                                        <span className="font-medium">Academic Year:</span> {courseStats.teachers[0]?.academic_year || "-"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground mb-1">
                                                        <span className="font-medium">Total Students:</span> {courseStats.teachers.reduce((sum, t) => sum + (t.student_count || 0), 0)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mb-1">
                                                        <span className="font-medium">Year {courseStats.teachers[0]?.academic_year || 2} Students:</span> 104
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-sm bg-secondary/10 p-2 mt-2 rounded">
                                                {(courseStats.total_teachers >= calculateRequiredTeachers(104)) ?
                                                    <span className="text-green-600 font-medium">Adequate</span> :
                                                    <span className="text-red-600 font-medium">Inadequate</span>} teacher staffing for this course.
                                                <br />
                                                {calculateRequiredTeachers(104) === 1 ? (
                                                    <span className="text-xs">This course has 104 students, which is within the capacity of a single teacher (up to 140 students).</span>
                                                ) : (
                                                    <span className="text-xs">This course has 104 students, requiring {calculateRequiredTeachers(104)} teachers based on workload capacity.</span>
                                                )}
                                                {courseStats.total_teachers > 0 && courseStats.total_teachers < calculateRequiredTeachers(104) && (
                                                    <span className="block mt-1 text-xs text-amber-600">
                                                        Currently {courseStats.total_teachers} teacher(s) assigned. Need {calculateRequiredTeachers(104) - courseStats.total_teachers} more.
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Assigned Teachers List */}
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Assigned Teachers</h4>
                                            {courseStats.teachers.length > 0 ? (
                                                <div className="border rounded-md">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Teacher</TableHead>
                                                                <TableHead>Role</TableHead>
                                                                <TableHead>Students</TableHead>
                                                                <TableHead>Academic Year</TableHead>
                                                                <TableHead>Semester</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {courseStats.teachers.map((teacher, idx) => (
                                                                <TableRow key={idx}>
                                                                    <TableCell className="font-medium">
                                                                        {teacher.teacher_name}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {teacher.is_assistant ? (
                                                                            <Badge variant="outline">Assistant</Badge>
                                                                        ) : (
                                                                            <Badge>Primary</Badge>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>{teacher.student_count || 0}</TableCell>
                                                                    <TableCell>{teacher.academic_year}</TableCell>
                                                                    <TableCell>{teacher.semester}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ) : (
                                                <div className="text-center p-4 border rounded-md text-muted-foreground">
                                                    No teachers assigned to this course yet
                                                </div>
                                            )}
                                        </div>

                                        {/* Link to create new assignment for this course */}
                                        <div className="flex justify-end">
                                            <Button
                                                onClick={() => navigate(`/teacher-course-assignment/create?course=${selectedCourseId}`)}
                                                size="sm"
                                            >
                                                <Plus className="h-4 w-4 mr-1" /> Assign Teacher
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground">No statistics available for this course</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Assignments Table */}
                    {assignmentsLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredAssignments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No assignments found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssignments.map((assignment) => (
                                    <TableRow
                                        key={assignment.id}
                                        className={selectedCourseId === assignment.course_detail?.id ? "bg-primary/5" : ""}
                                        onClick={() => handleCourseSelect(assignment.course_detail?.id || 0)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <TableCell className="font-medium">{assignment.id}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{assignment.course_detail?.course_detail?.course_name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {assignment.course_detail?.course_detail?.course_id}
                                                </div>
                                                {selectedCourseId === assignment.course_detail?.id && (
                                                    <Badge variant="outline" className="mt-1">Selected</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium flex items-center gap-1">
                                                {assignment.teacher_detail?.teacher_id?.first_name} {assignment.teacher_detail?.teacher_id?.last_name}
                                                {assignment.teacher_detail?.teacher_role === 'POP' && (
                                                    <Badge variant="secondary" className="ml-1 text-xs">POP</Badge>
                                                )}
                                                {assignment.teacher_detail?.is_industry_professional && (
                                                    <Badge variant="outline" className="ml-1 text-xs">🏢 Industry</Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {assignment.teacher_detail?.staff_code}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {assignment.is_assistant ? (
                                                <Badge variant="outline">Assistant</Badge>
                                            ) : (
                                                <Badge>Primary</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {assignment.course_detail?.teaching_dept_detail?.dept_name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{assignment.student_count || 0}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        viewDetails(assignment.id);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setAssignmentToDelete(assignment);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!assignmentToDelete} onOpenChange={() => setAssignmentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this assignment? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 