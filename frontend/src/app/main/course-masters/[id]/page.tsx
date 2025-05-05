import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useGetCourseMaster, useDeleteCourseMaster, CourseMaster } from '@/action/courseMaster';
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
  ChevronLeft,
  BookOpen,
  Clock,
  AlarmClock,
  School,
  TimerReset,
  Pencil,
  Trash,
  Loader2,
  Eye,
} from 'lucide-react';
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
import { toast } from 'sonner';

export default function CourseMasterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseMasterId = parseInt(id as string);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { data: courseMaster, isPending: isLoading, refetch } = useGetCourseMaster(courseMasterId);
  
  // Delete course master mutation
  const { mutate: deleteCourseMaster, isPending: isDeleting } = useDeleteCourseMaster(courseMasterId, () => {
    toast.success("Course master deleted successfully");
    navigate('/course-masters');
  });
  
  // Handle delete confirmation function
  const handleDeleteCourseMaster = () => {
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    deleteCourseMaster({});
    setShowDeleteDialog(false);
  };
  
  if (isLoading || !courseMaster) {
    return (
      <div className="py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/course-masters')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Course Masters
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
  
  const getCourseTypeLabel = (type: string) => {
    switch (type) {
      case 'T': return 'Theory';
      case 'L': return 'Lab';
      case 'LoT': return 'Lab & Theory';
      default: return type;
    }
  };
  
  return (
    <div className="py-4 w-full mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/course-masters')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Course Masters
        </Button>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            className="flex gap-1.5 items-center"
            onClick={() => navigate(`/courses?master_id=${courseMaster.id}`)}
          >
            <Eye className="h-4 w-4" /> View Courses
          </Button>
          <Button 
            variant="default" 
            className="flex gap-1.5 items-center"
            onClick={() => navigate(`/course-masters/${courseMaster.id}/edit`)}
          >
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button 
            variant="destructive" 
            className="flex gap-1.5 items-center"
            onClick={handleDeleteCourseMaster}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
      
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-md">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">
                  {courseMaster.course_id} - {courseMaster.course_name}
                </CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {getCourseTypeLabel(courseMaster.course_type)}
                </Badge>
                {courseMaster.is_zero_credit_course && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500">
                    Zero Credit
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <School className="h-3.5 w-3.5 text-muted-foreground" />
                    {courseMaster.course_dept_detail?.dept_name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    Credits: {courseMaster.credits}
                  </span>
                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Lecture Hours</span>
              <div className="flex items-center gap-1.5 mt-1">
                <AlarmClock className="h-4 w-4 text-primary" />
                <span className="font-medium">{courseMaster.lecture_hours}</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Tutorial Hours</span>
              <div className="flex items-center gap-1.5 mt-1">
                <TimerReset className="h-4 w-4 text-primary" />
                <span className="font-medium">{courseMaster.tutorial_hours}</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Practical Hours</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">{courseMaster.practical_hours}</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Regulation</span>
              <div className="flex items-center gap-1.5 mt-1">
                <School className="h-4 w-4 text-primary" />
                <span className="font-medium">{courseMaster.regulation}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Course Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Course Code</dt>
                      <dd className="font-medium">{courseMaster.course_id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Course Name</dt>
                      <dd className="font-medium">{courseMaster.course_name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Department</dt>
                      <dd className="font-medium">{courseMaster.course_dept_detail?.dept_name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Course Type</dt>
                      <dd className="font-medium">{getCourseTypeLabel(courseMaster.course_type)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Zero Credit Course</dt>
                      <dd className="font-medium">{courseMaster.is_zero_credit_course ? 'Yes' : 'No'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Credit Structure</CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Total Credits</dt>
                      <dd className="font-medium">{courseMaster.credits}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Lecture Hours</dt>
                      <dd className="font-medium">{courseMaster.lecture_hours}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Tutorial Hours</dt>
                      <dd className="font-medium">{courseMaster.tutorial_hours}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Practical Hours</dt>
                      <dd className="font-medium">{courseMaster.practical_hours}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Regulation</dt>
                      <dd className="font-medium">{courseMaster.regulation}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Related Courses</CardTitle>
                <CardDescription>Courses created from this course master</CardDescription>
              </CardHeader>
              <CardContent className="py-3">
                <Button 
                  variant="default" 
                  onClick={() => navigate(`/courses?master_id=${courseMaster.id}`)}
                  className="w-full"
                >
                  View All Related Courses
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => navigate('/course-masters')}>
            Back to List
          </Button>
          <Button 
            variant="default" 
            className="flex gap-1.5 items-center"
            onClick={() => navigate(`/course-masters/${courseMaster.id}/edit`)}
          >
            <Pencil className="h-4 w-4" /> Edit Course Master
          </Button>
        </CardFooter>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this course master?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course master
              <span className="font-semibold"> {courseMaster.course_id} - {courseMaster.course_name}</span>.
              Any courses created from this master may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 