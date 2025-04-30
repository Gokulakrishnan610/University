import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, Search, Mail, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetStudents, useDeleteStudent, Student } from '@/action/student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const StudentManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students data
  const { data: students, isPending: isLoading, refetch }= useGetStudents();
  
  const { mutate: deleteStudent } = useDeleteStudent(0, () => {
    refetch();
  });

  // Handle delete with confirmation
  const handleDelete = (id: number) => {
    deleteStudent(id);
  };

  const filteredStudents = students?.filter((student: Student) => {
    const searchTermLower = searchTerm.toLowerCase();
    const rollNo = student.roll_no?.toLowerCase() || '';
    const firstName = student.student_detail?.first_name?.toLowerCase() || '';
    const lastName = student.student_detail?.last_name?.toLowerCase() || '';
    const email = student.student_detail?.email?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    
    return rollNo.includes(searchTermLower) || 
           firstName.includes(searchTermLower) || 
           lastName.includes(searchTermLower) || 
           fullName.includes(searchTermLower) ||
           email.includes(searchTermLower);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-1">Manage your department's students</p>
        </div>
        <Button onClick={() => navigate('/students/create')}>
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, roll number..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-950 rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Roll No.</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold">Batch/Sem</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents?.length ? (
                filteredStudents.map((student: Student) => (
                  <TableRow 
                    key={student.id} 
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {student.student_detail?.first_name} {student.student_detail?.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {student.student_detail?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{student.roll_no || 'N/A'}</TableCell>
                    <TableCell>{student.dept_detail?.dept_name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>Batch: {student.batch}</span>
                        <span className="text-xs text-muted-foreground">Sem: {student.current_semester}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.student_type === 'Mgmt' ? 'default' : 'secondary'} className="font-normal">
                        {student.student_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/students/${student.id}/edit`);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100/50">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Student Record</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this student record? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(student.id)} 
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center py-6 text-muted-foreground">
                      <p className="mb-2">No students found</p>
                      {searchTerm && (
                        <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default StudentManagement; 