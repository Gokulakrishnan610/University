import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGetCourses, useDeleteCourse, Course } from '@/action/course';
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
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Pencil, Eye, BookOpen, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import CourseForm from './form';

export default function CourseManagement() {
  const navigate = useNavigate();
  const { data: coursesData, isPending: isLoading, refetch } = useGetCourses();
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const courses = coursesData || [];
  const { mutate: deleteCourse } = useDeleteCourse(0, () => {
    refetch();
    setCourseToDelete(null);
  });

  const handleDelete = () => {
    if (!courseToDelete) return;

    deleteCourse(undefined, {
      onSuccess: () => {
        toast.success('Course deleted', {
          description: `${courseToDelete.course_name} has been deleted successfully.`,
        });
        refetch();
        setCourseToDelete(null);
      },
      onError: (error: Error) => {
        toast.error('Error', {
          description: `Failed to delete course: ${error.message}`,
        });
        setCourseToDelete(null);
      },
    });
  };

  return (
    <div className="py-10 w-full mx-auto">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Course Management</CardTitle>
            </div>
            <CardDescription className="mt-1.5">
              Manage courses in your department
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Course
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/20">
              <BookOpen className="h-16 w-16 text-muted-foreground/60 mb-4" />
              <p className="text-muted-foreground text-lg mb-4">
                No courses found in your department
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Course
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course: Course) => (
                    <TableRow
                      key={course.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/courses/${course.id}`)}>
                      <TableCell className="font-medium">{course.course_code}</TableCell>
                      <TableCell>{course.course_name}</TableCell>
                      <TableCell>{course.department_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                          {course.course_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{course.course_year}</TableCell>
                      <TableCell>{course.course_semester}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[240px]">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/courses/${course.id}`);
                            }}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/courses/${course.id}?edit=true`);
                            }}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Course
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCourseToDelete(course);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateForm && (
        <CourseForm
          mode="create"
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            refetch();
          }}
        />
      )}

      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{courseToDelete?.course_name}</span>?
              <br /><br />
              This action cannot be undone. All associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 