import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useGetCourseMasters, useGetCourseMasterStats, CourseMaster, useDeleteCourseMaster } from '@/action/courseMaster';
import { useGetDepartments } from '@/action/department';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  BookOpen,
  Clock,
  Loader2,
  BookMarked,
  School,
  X,
  Library,
  GraduationCap,
  BookCopy,
  Filter,
  LayoutGrid,
  ChevronDown,
  Info,
  ShieldAlert,
  Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetCurrentDepartment } from '@/action/department';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

// Stat card component
interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  description: string;
  color: string;
}

const StatCard = ({ title, icon, count, description, color }: StatCardProps) => (
  <Card className={`shadow-sm border-l-4 ${color}`}>
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
          <div className="mt-1">
            <span className="text-2xl font-bold">{count}</span>
          </div>
        </div>
        <div className="p-2 rounded-full bg-background/80">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function CourseMastersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [courseTypeFilter, setCourseTypeFilter] = useState<string>('all');
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const pageSize = 10;

  const { data: courseMastersData, isPending: loadingCourseMasters, refetch: refetchCourseMasters } = useGetCourseMasters(
    page,
    pageSize,
    searchTerm,
    departmentFilter,
    courseTypeFilter
  );

  const { data: departmentsData, isPending: loadingDepartments } = useGetDepartments();
  const { data: statsData, isPending: loadingStats } = useGetCourseMasterStats();
  const { data: currentDepartment, isPending: loadingCurrentDept } = useGetCurrentDepartment();
  
  const departments = departmentsData || [];
  const courseMasters = courseMastersData?.results || [];
  const totalCount = courseMastersData?.count || 0;

  const totalPages = Math.ceil(totalCount / pageSize);

  // Effect to reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, departmentFilter, courseTypeFilter]);

  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourseMaster(
    courseToDelete || 0,
    () => {
      toast.success("Course master deleted successfully", {
        description: "The course master has been removed from the catalog."
      });
      refetchCourseMasters();
      setCourseToDelete(null);
    }
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    if (searchTerm) {
      setSearchTerm('');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(`/course-masters/${id}`);
  };

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

  const getDegreeTypeLabel = (type: string) => {
    switch (type) {
      case 'BE': return 'Bachelor of Engineering';
      case 'BTECH': return 'Bachelor of Technology';
      case 'ME': return 'Master of Engineering';
      case 'MTECH': return 'Master of Technology';
      case 'MBA': return 'Master of Business Administration';
      case 'MCA': return 'Master of Computer Applications';
      default: return type;
    }
  };

  // Check if the current department is the owner of the course master
  const canCreateCourse = !loadingCurrentDept && currentDepartment && currentDepartment.id !== undefined;

  const canEditOrDelete = (course: CourseMaster) => {
    // Strictly use backend permissions
    return {
      canEdit: course.permissions?.can_edit || false,
      canDelete: course.permissions?.can_delete || false
    };
  };

  const handleCreateCourse = () => {
    navigate('/course-masters/create');
  };

  const handleEditCourse = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/course-masters/${id}/edit`);
  };

  const handleDeleteCourse = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCourseToDelete(id);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteCourse({});
    }
  };

  // Add scroll restoration
  useScrollRestoration('course-masters-page');

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Library className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Course Masters Catalog</CardTitle>
            </div>
            <div>
              {canCreateCourse ? (
                <Button onClick={handleCreateCourse} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Create New Course
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button disabled className="flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Create New Course
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You need to be associated with a department to create courses</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <CardDescription className="mt-1.5">
            Browse and manage all courses in the university catalog
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Theory Courses"
              icon={<BookOpen className="h-5 w-5 text-blue-500" />}
              count={loadingStats ? 0 : statsData?.theory_courses_count || 0}
              description="Pure theory courses in the catalog"
              color="border-l-blue-500"
            />
            <StatCard
              title="Lab Courses"
              icon={<LayoutGrid className="h-5 w-5 text-green-500" />}
              count={loadingStats ? 0 : statsData?.lab_courses_count || 0}
              description="Laboratory-focused courses"
              color="border-l-green-500"
            />
            <StatCard
              title="Combined Courses"
              icon={<BookCopy className="h-5 w-5 text-purple-500" />}
              count={loadingStats ? 0 : statsData?.combined_courses_count || 0}
              description="Courses with both theory and lab components"
              color="border-l-purple-500"
            />
            <StatCard
              title="Zero Credit Courses"
              icon={<GraduationCap className="h-5 w-5 text-red-500" />}
              count={loadingStats ? 0 : statsData?.zero_credit_courses_count || 0}
              description="Non-credit courses in the catalog"
              color="border-l-red-500"
            />
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  Search & Filters
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Search for courses by name or code. Filter by department or course type.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="py-3">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by course code or name..."
                    className="pl-8 pr-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8"
                      onClick={handleClearSearch}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 md:w-2/5">
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.dept_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={courseTypeFilter} onValueChange={setCourseTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Course Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="T">Theory</SelectItem>
                      <SelectItem value="L">Lab</SelectItem>
                      <SelectItem value="LoT">Lab & Theory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course List */}
          <div className="relative">
            {loadingCourseMasters ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="rounded-md border shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-medium">Course Code</TableHead>
                        <TableHead className="font-medium">Course Name</TableHead>
                        <TableHead className="font-medium">Department</TableHead>
                        <TableHead className="font-medium">Type</TableHead>
                        <TableHead className="font-medium">Credits</TableHead>
                        <TableHead className="font-medium">Degree</TableHead>
                        <TableHead className="text-right font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courseMasters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <BookMarked className="h-8 w-8 text-muted-foreground/60" />
                              <p>No course masters found</p>
                              <Button
                                variant="link"
                                onClick={() => {
                                  setSearchTerm('');
                                  setDepartmentFilter('all');
                                  setCourseTypeFilter('all');
                                }}
                              >
                                Clear all filters
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        courseMasters.map((course) => {
                          const { canEdit, canDelete } = canEditOrDelete(course);
                          const isOwned = course.permissions?.is_owner ||
                            (!loadingCurrentDept && currentDepartment && course.course_dept_id === currentDepartment.id);

                          return (
                            <TableRow
                              key={course.id}
                              className="cursor-pointer hover:bg-accent/50"
                              onClick={() => handleViewDetails(course.id)}
                            >
                              <TableCell className="font-medium">{course.course_id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {course.course_name}
                                  {isOwned && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Shield className="h-3.5 w-3.5 text-primary/70" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>You own this course</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </TableCell>
                              
                              <TableCell className="flex items-center gap-1.5">
                                <School className="h-4 w-4 text-muted-foreground" />
                                {course.course_dept_detail?.dept_name}
                              </TableCell>
                                  
                              <TableCell>
                                <div className="flex flex-wrap gap-1.5">
                                  <Badge variant="outline" className={getCourseTypeBadgeClass(course.course_type)}>
                                    {getCourseTypeLabel(course.course_type)}
                                  </Badge>
                                  {course.is_zero_credit_course && (
                                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-200">
                                      Zero Credit
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {course.credits || 0}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-200">
                                  {getDegreeTypeLabel(course.degree_type)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="font-medium"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetails(course.id);
                                    }}
                                  >
                                    View
                                  </Button>

                                  {canEdit ? (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="font-medium"
                                      onClick={(e) => handleEditCourse(course.id, e)}
                                    >
                                      Edit
                                    </Button>
                                  ) : (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div>
                                            <Button
                                              variant="default"
                                              size="sm"
                                              disabled
                                              className="font-medium"
                                            >
                                              Edit
                                            </Button>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>You don't have permission to edit this course</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                  {canDelete && (
                                    <AlertDialog open={courseToDelete === course.id} onOpenChange={(open) => !open && setCourseToDelete(null)}>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          className="font-medium"
                                          onClick={(e) => handleDeleteCourse(course.id, e)}
                                        >
                                          Delete
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will permanently delete the course master "{course.course_name}".
                                            This action cannot be undone.
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
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Deleting...
                                              </>
                                            ) : (
                                              'Delete'
                                            )}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {Math.min((page - 1) * pageSize + 1, totalCount)} to {Math.min(page * pageSize, totalCount)} of {totalCount} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm">
                        Page {page} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 