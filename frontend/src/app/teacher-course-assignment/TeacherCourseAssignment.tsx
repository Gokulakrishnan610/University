import React, { useState } from 'react';
import { useGetTeachers } from '@/action/teacher';
import { useGetCourses } from '@/action/course';
import { useGetTeacherCourseAssignments, useCreateTeacherCourseAssignment, useDeleteTeacherCourseAssignment } from '@/action/teacherCourse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import type { Teacher } from '@/action/teacher';
import type { Course } from '@/action/course';

export function TeacherCourseAssignment() {
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [semester, setSemester] = useState<string>('');
    const [academicYear, setAcademicYear] = useState<string>('');

    // Fetch data
    const { data: teachers = [] } = useGetTeachers();
    const { data: courses = [] } = useGetCourses();
    const { data: assignments = [], refetch: refetchAssignments } = useGetTeacherCourseAssignments();

    // Create assignment mutation
    const createAssignment = useCreateTeacherCourseAssignment(() => {
        refetchAssignments();
    });

    // Delete assignment mutation
    const deleteAssignment = useDeleteTeacherCourseAssignment(() => {
        refetchAssignments();
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacher || !selectedCourse || !semester || !academicYear) {
            toast.error('Please fill all fields');
            return;
        }

        createAssignment.mutate({
            teacher: parseInt(selectedTeacher),
            course: parseInt(selectedCourse),
            semester: parseInt(semester),
            academic_year: parseInt(academicYear)
        });
    };

    const handleDelete = (id: number) => {
        deleteAssignment.mutate(id);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Teacher Course Assignment</h1>

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="teacher">Select Teacher</Label>
                        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a teacher" />
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

                    <div>
                        <Label htmlFor="course">Select Course</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
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

                    <div>
                        <Label htmlFor="semester">Semester</Label>
                        <Select value={semester} onValueChange={setSemester}>
                            <SelectTrigger>
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

                    <div>
                        <Label htmlFor="academicYear">Academic Year</Label>
                        <Input
                            type="number"
                            id="academicYear"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            placeholder="Enter academic year"
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full md:w-auto">
                    Create Assignment
                </Button>
            </form>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Current Assignments</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead>Academic Year</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    No assignments found
                                </TableCell>
                            </TableRow>
                        ) : (
                            assignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell>
                                        {assignment.teacher.teacher.first_name} {assignment.teacher.teacher.last_name}
                                    </TableCell>
                                    <TableCell>{assignment.course.course_name}</TableCell>
                                    <TableCell>{assignment.semester}</TableCell>
                                    <TableCell>{assignment.academic_year}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(assignment.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 