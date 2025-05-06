import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useGetCourseMaster, useDeleteCourseMaster, useGetCourseMasterStats } from '@/action/courseMaster';
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
  BookCopy,
  CircleDot,
  Building,
  LayoutGrid,
  Library,
  Calendar,
  GraduationCap,
  FileText,
  ExternalLink,
  ShieldAlert,
  Shield,
  AlertTriangle,
  Lock,
  Plus,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Stat item component
interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconColor?: string;
}

const StatItem = ({ icon, label, value, iconColor = 'text-primary' }: StatItemProps) => (
  <div className="flex flex-col">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1.5 mt-1">
      <div className={iconColor}>{icon}</div>
      <span className="font-medium">{value}</span>
    </div>
  </div>
);

export default function CourseMasterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseMasterId = parseInt(id as string);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: courseMasterResponse, isPending: isLoading, refetch } = useGetCourseMaster(courseMasterId);
  const { data: statsData, isPending: loadingStats } = useGetCourseMasterStats();
  
  // Extract course master data from response
  const courseMaster = courseMasterResponse?.data;
  
  // Get related courses count from course master data (if available)
  const relatedCoursesCount = courseMaster?.related_courses_count || 0;
  
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
      <div className="py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
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
  
  const getCourseTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'T': return 'bg-blue-500/10 text-blue-500 border-blue-200';
      case 'L': return 'bg-green-500/10 text-green-500 border-green-200';
      case 'LoT': return 'bg-purple-500/10 text-purple-500 border-purple-200';
      default: return 'bg-primary/10 text-primary';
    }
  };
  
  const getCourseIcon = (type: string) => {
    switch (type) {
      case 'T': return <BookOpen className="h-6 w-6 text-blue-500" />;
      case 'L': return <LayoutGrid className="h-6 w-6 text-green-500" />;
      case 'LoT': return <BookCopy className="h-6 w-6 text-purple-500" />;
      default: return <BookOpen className="h-6 w-6 text-primary" />;
    }
  };
  
  return (
    <div className="py-4 space-y-6">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-4">
            <div className={`${courseMaster.course_type === 'T' ? 'bg-blue-500/10' : courseMaster.course_type === 'L' ? 'bg-green-500/10' : 'bg-purple-500/10'} p-3 rounded-md`}>
              {getCourseIcon(courseMaster.course_type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <CardTitle className="text-2xl">
                  {courseMaster.course_id} - {courseMaster.course_name}
                </CardTitle>
                <Badge variant="outline" className={getCourseTypeBadgeClass(courseMaster.course_type)}>
                  {getCourseTypeLabel(courseMaster.course_type)}
                </Badge>
                {courseMaster.is_zero_credit_course && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-200">
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
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Regulation: {courseMaster.regulation}
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
          <Tabs defaultValue="overview" className="mt-3" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="structure" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Credit Structure
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <School className="h-4 w-4 text-primary" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="space-y-4">
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-sm text-muted-foreground">Course Code</span>
                        <span className="font-medium">{courseMaster.course_id}</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-sm text-muted-foreground">Course Name</span>
                        <span className="font-medium">{courseMaster.course_name}</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-sm text-muted-foreground">Department</span>
                        <span className="font-medium flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-muted-foreground" />
                          {courseMaster.course_dept_detail?.dept_name}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-sm text-muted-foreground">Course Type</span>
                        <Badge variant="outline" className={getCourseTypeBadgeClass(courseMaster.course_type)}>
                          {getCourseTypeLabel(courseMaster.course_type)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Zero Credit Course</span>
                        <Badge variant={courseMaster.is_zero_credit_course ? "outline" : "secondary"} className={courseMaster.is_zero_credit_course ? "bg-red-500/10 text-red-500 border-red-200" : ""}>
                          {courseMaster.is_zero_credit_course ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Academic Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="space-y-4">
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-sm text-muted-foreground">Total Credits</span>
                        <span className="font-medium">{courseMaster.credits}</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-sm text-muted-foreground">Regulation</span>
                        <span className="font-medium">{courseMaster.regulation}</span>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-sm text-muted-foreground">Related Courses</span>
                        <span className="font-medium">{relatedCoursesCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Department</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="link" className="p-0 h-auto font-medium text-primary"
                                onClick={() => navigate(`/departments/${courseMaster.course_dept_id}`)}
                              >
                                {courseMaster.course_dept_detail?.dept_name}
                                <ExternalLink className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View department details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {relatedCoursesCount > 0 && (
                  <Card className="shadow-sm md:col-span-2">
                    <CardHeader className="py-4">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookCopy className="h-4 w-4 text-primary" />
                        Related Courses
                      </CardTitle>
                      <CardDescription>
                        This course master is used in {relatedCoursesCount} course{relatedCoursesCount !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-0">
                      <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <BookCopy className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{relatedCoursesCount}</span>
                          <span className="text-muted-foreground">courses use this master template</span>
                        </div>
                        <Button 
                          onClick={() => navigate(`/courses?master_id=${courseMaster.id}`)}
                          className="flex items-center gap-1.5"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                          View All Courses
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="structure" className="pt-4">
              <div className="grid grid-cols-1 gap-6">
                <Card className="shadow-sm border-t-4 border-t-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Credit Structure
                    </CardTitle>
                    <CardDescription>
                      The distribution of hours and credits for this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-6 bg-muted/30 p-6 rounded-lg">
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-500/10 rounded-full p-3 mb-3">
                          <AlarmClock className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">{courseMaster.lecture_hours}</div>
                        <div className="text-sm text-muted-foreground">Lecture Hours</div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="bg-purple-500/10 rounded-full p-3 mb-3">
                          <TimerReset className="h-6 w-6 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold">{courseMaster.tutorial_hours}</div>
                        <div className="text-sm text-muted-foreground">Tutorial Hours</div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="bg-green-500/10 rounded-full p-3 mb-3">
                          <LayoutGrid className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold">{courseMaster.practical_hours}</div>
                        <div className="text-sm text-muted-foreground">Practical Hours</div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="bg-amber-500/10 rounded-full p-3 mb-3">
                          <GraduationCap className="h-6 w-6 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold">{courseMaster.credits}</div>
                        <div className="text-sm text-muted-foreground">Total Credits</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
                      <div className="flex items-start gap-3">
                        <CircleDot className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium mb-1">Credit Calculation</h3>
                          <p className="text-sm text-muted-foreground">
                            Credits are typically calculated as (Lecture hours) + (Tutorial hours/2) + (Practical hours/2).
                            For this course: {courseMaster.lecture_hours} + {courseMaster.tutorial_hours}/2 + {courseMaster.practical_hours}/2 = {courseMaster.credits} credits
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {!loadingStats && statsData && (
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Library className="h-5 w-5 text-primary" />
                        Course Type Statistics
                      </CardTitle>
                      <CardDescription>
                        Distribution of course types in the university catalog
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Theory</span>
                          </div>
                          <div className="text-2xl font-bold mt-1">{statsData?.theory_courses_count || 0}</div>
                          <div className="text-xs text-muted-foreground mt-1">Total theory courses</div>
                        </div>
                        
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                          <div className="flex items-center gap-2 mb-1">
                            <LayoutGrid className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Lab</span>
                          </div>
                          <div className="text-2xl font-bold mt-1">{statsData?.lab_courses_count || 0}</div>
                          <div className="text-xs text-muted-foreground mt-1">Total lab courses</div>
                        </div>
                        
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                          <div className="flex items-center gap-2 mb-1">
                            <BookCopy className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">Combined</span>
                          </div>
                          <div className="text-2xl font-bold mt-1">{statsData?.combined_courses_count || 0}</div>
                          <div className="text-xs text-muted-foreground mt-1">Lab & Theory courses</div>
                        </div>
                        
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                          <div className="flex items-center gap-2 mb-1">
                            <CircleDot className="h-4 w-4 text-red-500" />
                            <span className="font-medium">Zero Credit</span>
                          </div>
                          <div className="text-2xl font-bold mt-1">{statsData?.zero_credit_courses_count || 0}</div>
                          <div className="text-xs text-muted-foreground mt-1">Non-credit courses</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t pt-6 pb-4 flex justify-between items-center gap-4 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => navigate('/course-masters')}
            className="flex items-center gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Button>
          <div className="flex flex-wrap gap-2">
                {courseMaster.permissions?.can_delete && (
          <Button 
            variant="destructive" 
            className="flex gap-1.5 items-center"
            onClick={handleDeleteCourseMaster}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
            {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}
            {courseMaster.permissions?.can_edit && (
              <Button 
                variant="default" 
                className="flex gap-1.5 items-center"
                onClick={() => navigate(`/course-masters/${courseMaster.id}/edit`)}
              >
                <Pencil className="h-4 w-4" /> Edit Course Master
              </Button>
            )}
          </div>
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
              {relatedCoursesCount > 0 && (
                <div className="mt-2 p-2 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 rounded flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-800 dark:text-amber-200">
                    Warning: This course master is used by {relatedCoursesCount} course{relatedCoursesCount !== 1 ? 's' : ''}. Deleting it may affect these courses.
                  </span>
                </div>
              )}
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