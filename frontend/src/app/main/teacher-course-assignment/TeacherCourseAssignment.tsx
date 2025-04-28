import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useGetTeacherCourseAssignments, useDeleteTeacherCourseAssignment, TeacherCourseAssignment as TCAssignment } from '@/action/teacherCourse';
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

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string[]>([]);
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string[]>([]);

    const {
        data: assignments = [],
        isPending: assignmentsLoading,
        refetch: refetchAssignments
    } = useGetTeacherCourseAssignments();

    // Delete assignment mutation
    const deleteAssignment = useDeleteTeacherCourseAssignment(() => {
        toast.success('Teacher course assignment deleted successfully');
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

            return matchesSearch && matchesDepartment && matchesTeacher;
        });
    }, [assignments, searchQuery, selectedDepartmentFilter, selectedTeacherFilter]);

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
    };

    // Function to export assignments as CSV
    const exportToCSV = () => {
        const headers = ['Teacher', 'Course', 'Course Code', 'Department'];

        const csvRows = [
            headers.join(','),
            ...filteredAssignments.map(a => [
                `"${a.teacher_detail.teacher_id.first_name} ${a.teacher_detail.teacher_id.last_name}"`,
                `"${a.course_detail.course_detail.course_name}"`,
                `"${a.course_detail.course_detail.course_id}"`,
                `"${a.course_detail.teaching_dept_detail.dept_name}"`
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

                            {(searchQuery || selectedTeacherFilter.length > 0 || selectedDepartmentFilter.length > 0) && (
                                <Button variant="ghost" onClick={clearFilters} className="ml-auto">
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

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
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell>
                                            <div className="font-medium">
                                                {assignment.teacher_detail?.teacher_id?.first_name} {assignment.teacher_detail?.teacher_id?.last_name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {assignment.teacher_detail?.staff_code}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {assignment.course_detail?.course_detail?.course_name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {assignment.course_detail?.course_detail?.course_id}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {assignment.course_detail?.teaching_dept_detail?.dept_name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => viewDetails(assignment.id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setAssignmentToDelete(assignment)}
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