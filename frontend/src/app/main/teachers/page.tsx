import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGetTeachers, useDeleteTeacher, Teacher } from '@/action';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import TeacherForm from './form';

export default function TeacherManagement() {
  const navigate = useNavigate();
  const { data: teachersData, isPending: isLoading, refetch } = useGetTeachers();
  const teachers = teachersData?.data || [];
  const { mutate: deleteTeacher } = useDeleteTeacher(0, () => refetch());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDelete = (teacher: Teacher) => {
    if (window.confirm(`Are you sure you want to delete this teacher?`)) {
      deleteTeacher(undefined, {
        onSuccess: () => {
          toast.success('Teacher deleted', {
            description: 'Teacher has been deleted successfully.',
          });
          refetch();
        },
        onError: (error: Error) => {
          toast.error('Error', {
            description: `Failed to delete teacher: ${error.message}`,
          });
        },
      });
    }
  };

  return (
    <div className="container py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Teacher Management</CardTitle>
            <CardDescription>
              Manage teachers, assign departments, and more
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground text-sm mb-4">
                No teachers found. Add your first teacher!
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher: Teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.staff_code || 'N/A'}</TableCell>
                    <TableCell>
                      {teacher.teacher.first_name} {teacher.teacher.last_name}
                    </TableCell>
                    <TableCell>{teacher.teacher_role}</TableCell>
                    <TableCell>{teacher.dept?.dept_name || 'Not assigned'}</TableCell>
                    <TableCell>{teacher.teacher_specialisation || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/teachers/${teacher.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/teachers/${teacher.id}?edit=true`)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(teacher)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isCreateModalOpen && (
        <TeacherForm 
          mode="create"
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
} 