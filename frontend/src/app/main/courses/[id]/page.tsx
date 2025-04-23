import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import {
  useGetCourse,
  useUpdateCourse,
  useDeleteCourse,
  Course
} from '@/action/course';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
import { ChevronLeft, Pencil, BookOpen, Clock, GraduationCap, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CourseForm from '../form';

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isEditMode = queryParams.get('edit') === 'true';
  const [showEditForm, setShowEditForm] = useState(isEditMode);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const courseId = parseInt(id as string);

  const { data: course, isPending: isLoading, refetch } = useGetCourse(courseId);
  const { mutate: updateCourse } = useUpdateCourse(courseId, () => {
    toast.success("Course updated successfully");
    refetch();
    setShowEditForm(false);
  });

  const { mutate: deleteCourse } = useDeleteCourse(courseId, () => {
    toast.success("Course deleted successfully");
    navigate('/courses');
  });

  // Clean up URL if edit parameter exists
  useEffect(() => {
    if (isEditMode) {
      const cleanUrl = location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [isEditMode, location.pathname]);

  if (isLoading || !course) {
    return (
      <div className="py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/courses')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Button>
        </div>
        <Card className="shadow-md">
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = () => {
    deleteCourse(undefined, {
      onSuccess: () => {
        toast.success("Course deleted successfully");
        navigate('/courses');
      },
      onError: (error: Error) => {
        toast.error("Failed to delete course", {
          description: error.message || "An error occurred while deleting the course."
        });
      }
    });
    setShowDeleteDialog(false);
  };

  return (
    <div className="py-10 w-full mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/courses')} className="transition-colors">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Button>
      </div>

      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {course.course_name}
                <Badge className="ml-3 bg-primary/20 text-primary hover:bg-primary/30">
                  {course.course_code}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <span className="font-medium text-muted-foreground">{course.department_name}</span>
                <span className="flex items-center ml-4 text-sm text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5 mr-1" /> {course.course_type}
                </span>
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Course
            </Button>
            <Button variant="outline" onClick={() => setShowEditForm(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Course
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Course Information
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">Year:</span>
                    <span className="font-medium">{course.course_year}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">Semester:</span>
                    <span className="font-medium">{course.course_semester}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">Credits:</span>
                    <span className="font-medium">{course.credits}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Course Hours
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-muted-foreground block mb-1">Lecture Hours:</span>
                    <span className="font-medium">{course.lecture_hours} hours</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Tutorial Hours:</span>
                    <span className="font-medium">{course.tutorial_hours} hours</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Practical Hours:</span>
                    <span className="font-medium">{course.practical_hours} hours</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  Additional Information
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-muted-foreground block mb-1">Regulation:</span>
                    <span className="font-medium">{course.regulation}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Course Type:</span>
                    <span className="font-medium">{course.course_type}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showEditForm && (
        <CourseForm
          mode="update"
          course={course}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            refetch();
          }}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{course.course_name}</span>?
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