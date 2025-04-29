import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Library,
  BookOpen,
  School,
  PlusCircle,
  Search,
  ArrowUpDown,
  Share2,
  ArrowLeftRight,
  BookOpenCheck,
  Building,
  Loader2,
  Info,
  Users,
  GraduationCap,
  ListFilter,
  HelpCircle,
  BookMarked,
  BookCopy,
  ChartPieIcon,
  PieChart,
  CircleDot
} from 'lucide-react';
import { 
  useGetCurrentDepartmentCourses, 
  useCreateCourse,
  Course 
} from '@/action/course';
import { useGetDepartments, useGetCurrentDepartment } from '@/action/department';
import { useGetCourseMasters, useCreateCourseMaster } from '@/action/courseMaster'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import CourseForm, { CourseFormValues } from './course-form';
import CourseMasterForm, { CourseMasterFormValues } from './course-master-form';
import { getRelationshipBadgeColor, getRelationshipShortName } from '@/lib/utils';
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Stats card component for the dashboard
interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  total: number;
  description: string;
}

const StatCard = ({ title, icon, color, count, total, description }: StatCardProps) => (
  <div className={`border rounded-lg p-4 shadow-sm ${color}`}>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold">{count}</span>
          <span className="text-sm text-muted-foreground">of {total} courses</span>
        </div>
      </div>
      <div className="p-2 rounded-full bg-background/80">
        {icon}
      </div>
    </div>
    <p className="mt-2 text-xs text-muted-foreground">{description}</p>
  </div>
);

export default function CourseManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddCourseMasterDialog, setShowAddCourseMasterDialog] = useState(false);
  const [courseCreationOption, setCourseCreationOption] = useState<'select' | 'create'>('select');
  const [defaultDeptId, setDefaultDeptId] = useState<number | undefined>(undefined);
  const navigate = useNavigate();
  
  const { data: departmentData, isPending, refetch } = useGetCurrentDepartmentCourses();
  const { data: departmentsData, isPending: loadingDepartments } = useGetDepartments();
  const { data: courseMastersData, isPending: loadingCourseMasters, refetch: refetchCourseMasters } = useGetCourseMasters();
  // console.log(courseMastersData)
  const { data: currentDepartment, isPending: loadingCurrentDept } = useGetCurrentDepartment();
  
  const departments = departmentsData || [];
  const courseMasters = courseMastersData || [];
  
  // Set default department ID when current department is loaded
  useEffect(() => {
    if (currentDepartment && currentDepartment.id) {
      setDefaultDeptId(currentDepartment.id);
    }
  }, [currentDepartment]);
  
  const allOwnedCourses = departmentData?.owned_courses?.data || [];
  const allTeachingCourses = departmentData?.teaching_courses?.data || [];
  const allReceivingCourses = departmentData?.receiving_courses?.data || [];
  const allForDeptCourses = departmentData?.for_dept_courses?.data || [];
  
  // Get role descriptions
  const ownedCoursesRole = departmentData?.owned_courses?.role || 'owner';
  const teachingCoursesRole = departmentData?.teaching_courses?.role || 'teacher';
  const receivingCoursesRole = departmentData?.receiving_courses?.role || 'owner_not_teacher';
  const forDeptCoursesRole = departmentData?.for_dept_courses?.role || 'learner';
  
  // Get descriptions
  const ownedCoursesDescription = departmentData?.owned_courses?.description || 'Courses created and maintained by our department';
  const teachingCoursesDescription = departmentData?.teaching_courses?.description || 'Courses created by other departments that our department teaches';
  const receivingCoursesDescription = departmentData?.receiving_courses?.description || 'Our courses that are taught by faculty from other departments';
  const forDeptCoursesDescription = departmentData?.for_dept_courses?.description || 'External courses our students take';
  
  // Filter courses based on search query
  const filterCourses = (courses: Course[]) => {
    if (!searchQuery.trim()) return courses;
    
    const query = searchQuery.toLowerCase().trim();
    return courses.filter(course => 
      course.course_detail.course_id.toLowerCase().includes(query) ||
      course.course_detail.course_name.toLowerCase().includes(query) ||
      course.teaching_dept_detail.dept_name.toLowerCase().includes(query) ||
      course.for_dept_detail.dept_name.toLowerCase().includes(query) ||
      `year ${course.course_year}`.includes(query) ||
      `sem ${course.course_semester}`.includes(query) ||
      course.teaching_status.toLowerCase().includes(query) ||
      (course.relationship_type?.description.toLowerCase().includes(query))
    );
  };
  
  // Apply filters using useMemo to avoid unnecessary recalculations
  const ownedCourses = useMemo(() => filterCourses(allOwnedCourses), [allOwnedCourses, searchQuery]);
  const teachingCourses = useMemo(() => filterCourses(allTeachingCourses), [allTeachingCourses, searchQuery]);
  const receivingCourses = useMemo(() => filterCourses(allReceivingCourses), [allReceivingCourses, searchQuery]);
  const forDeptCourses = useMemo(() => filterCourses(allForDeptCourses), [allForDeptCourses, searchQuery]);
  
  // Count courses that are both owned and taught by the department
  const selfOwnedSelfTaughtCount = useMemo(() => {
    return allOwnedCourses.filter(course => 
      course.course_detail.course_dept_detail.id === course.teaching_dept_id
    ).length;
  }, [allOwnedCourses]);
  
  // Create course mutation
  const { mutate: createCourse, isPending: isCreating } = useCreateCourse(() => {
    refetch();
    toast.success("Course created successfully");
    setShowAddDialog(false);
  });
  
  // For creating new course master
  const { mutate: createCourseMaster, isPending: isCreatingCourseMaster } = useCreateCourseMaster(() => {
    refetchCourseMasters();
    toast.success("Course master created successfully");
    setShowAddCourseMasterDialog(false);
    // Open the add course dialog with select option after creating a course master
    setShowAddDialog(true);
    setCourseCreationOption('select');
  });
  
  const handleCreateCourse = (values: CourseFormValues) => {
    createCourse(values);
  };
  
  const handleCreateCourseMaster = (values: CourseMasterFormValues) => {
    createCourseMaster({
      course_id: values.course_id,
      course_name: values.course_name,
      course_dept_id: values.course_dept_id
    });
  };
  
  const handleOpenCourseDialog = () => {
    setCourseCreationOption('select');
    setShowAddDialog(true);
  };
  
  const handleOpenCreateCourseMasterDialog = () => {
    setShowAddCourseMasterDialog(true);
  };
  
  const handleCourseCreationOptionChange = (option: 'select' | 'create') => {
    setCourseCreationOption(option);
    if (option === 'create') {
      setShowAddDialog(false);
      setShowAddCourseMasterDialog(true);
    }
  };
  
  const handleNavigateToDetail = (courseId: number, e?: React.MouseEvent) => {
    // If triggered by an event (like a button click), stop propagation
    if (e) {
      e.stopPropagation();
    }
    // Navigate to course detail page
    navigate(`/courses/${courseId}`);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Library className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Course Management</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/courses/allocations')}
                className="flex items-center gap-1.5"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>Resource Allocations</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/courses/all-courses')}
                className="flex items-center gap-1.5"
              >
                <ListFilter className="h-4 w-4" />
                <span>View All Courses</span>
              </Button>
            </div>
          </div>
          <CardDescription>
            Manage courses for your department, including those you own, teach, and your students take
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          {/* Department Role Dashboard */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="h-5 w-5 text-primary" />
              <h3 className="text-base font-medium">Departmental Role Summary</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="h-7 w-7 p-0 rounded-full">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>This dashboard shows the number of courses your department is involved with in different roles.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard 
                title="Course Owner" 
                icon={<BookOpen className="h-5 w-5 text-blue-500" />}
                color="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900"
                count={allOwnedCourses.length}
                total={allOwnedCourses.length}
                description="Courses created and maintained by your department"
              />
              
              <StatCard 
                title="Teaching Department" 
                icon={<School className="h-5 w-5 text-orange-500" />}
                color="bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900"
                count={allTeachingCourses.length}
                total={allTeachingCourses.length}
                description="Courses you teach for other departments"
              />
              
              <StatCard 
                title="For Our Students" 
                icon={<GraduationCap className="h-5 w-5 text-purple-500" />}
                color="bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900"
                count={allForDeptCourses.length}
                total={allForDeptCourses.length}
                description="External courses taken by your department's students"
              />
              
              <StatCard 
                title="Self-Taught Courses" 
                icon={<CircleDot className="h-5 w-5 text-green-500" />}
                color="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900"
                count={selfOwnedSelfTaughtCount}
                total={allOwnedCourses.length}
                description="Courses you both own and teach (subset of Course Owner)"
              />
            </div>
          </div>
          
          {/* Department Role Information - Enhanced */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Course Role Definitions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-start gap-2 cursor-help p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <BookOpen className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Course Owner</span>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          Department that created and controls the course content
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>The <strong>Course Owner</strong> department creates the course, defines its content and curriculum, and maintains academic standards. These are courses where your department is the originating department.</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-start gap-2 cursor-help p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <School className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Teaching Department</span>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          Department teaching courses owned by other departments
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>The <strong>Teaching Department</strong> provides faculty to teach courses that are owned by other departments. These courses are not created by your department, but your faculty teaches them.</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-start gap-2 cursor-help p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <ArrowLeftRight className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Others Teach Ours</span>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          Your courses taught by other departments
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>These are courses <strong>owned by your department</strong> but <strong>taught by faculty from other departments</strong>. Your department creates and maintains the curriculum, but another department handles the teaching.</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-start gap-2 cursor-help p-2 hover:bg-muted/50 rounded-md transition-colors">
                      <GraduationCap className="h-4 w-4 mt-0.5 text-purple-500 flex-shrink-0" />
                      <div>
                        <span className="font-medium">For Our Students</span>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          External courses taken by your students
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>These are courses that your department's students take, but are both <strong>owned and taught by other departments</strong>. Your department is not involved in creating or teaching these courses.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Tabs defaultValue="owned">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="flex flex-wrap h-auto p-1">
                <TabsTrigger value="owned" className="flex items-center gap-1 h-9 px-3 py-1">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="hidden sm:inline">We Own</span>
                  <span className="inline sm:hidden">Owner</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {ownedCourses.length}/{allOwnedCourses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="teaching" className="flex items-center gap-1 h-9 px-3 py-1">
                  <School className="h-4 w-4 text-orange-500" />
                  <span className="hidden sm:inline">We Teach</span>
                  <span className="inline sm:hidden">Teaching</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {teachingCourses.length}/{allTeachingCourses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="receiving" className="flex items-center gap-1 h-9 px-3 py-1">
                  <ArrowLeftRight className="h-4 w-4 text-green-500" />
                  <span className="hidden sm:inline">Others Teach Ours</span>
                  <span className="inline sm:hidden">Others Teach</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {receivingCourses.length}/{allReceivingCourses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="fordept" className="flex items-center gap-1 h-9 px-3 py-1">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  <span className="hidden sm:inline">For Our Students</span>
                  <span className="inline sm:hidden">For Students</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {forDeptCourses.length}/{allForDeptCourses.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center justify-between mb-4 gap-2">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground " />
                  <Input
                    type="search"
                    placeholder="Search courses..."
                    className="w-full pl-8 pr-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      onClick={handleClearSearch}
                      className="absolute right-0 top-0 h-9 px-2"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Button className="flex gap-2 items-center whitespace-nowrap" onClick={handleOpenCourseDialog}>
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Course</span>
                </Button>
              </div>
            </div>
            
            {/* Owned Courses Tab */}
            <TabsContent value="owned">
              <Card>
                <CardHeader className="px-6 py-4 bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <span>Courses We Own</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 rounded-full">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p>As the <strong>Course Owner</strong>, your department has created these courses and controls their content, curriculum, and academic standards.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-0 sm:text-right">
                      {searchQuery ? (
                        <span>
                          Showing {ownedCourses.length} of {allOwnedCourses.length} courses
                          {" "}<Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button>
                        </span>
                      ) : (
                        ownedCoursesDescription
                      )}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">
                            <div className="flex items-center gap-1">
                              Course ID
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead>Teaching Department</TableHead>
                          <TableHead>Relationship</TableHead>
                          <TableHead>Year & Semester</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isPending ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Loading course data...
                            </TableCell>
                          </TableRow>
                        ) : ownedCourses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {searchQuery ? (
                                <>No courses match your search. <Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button></>
                              ) : (
                                "No owned courses found. Create your first course."
                              )}
                            </TableCell>
                          </TableRow>
                        ) : (
                          ownedCourses.map((course) => (
                            <TableRow 
                              key={course.id} 
                              className="cursor-pointer hover:bg-muted/50" 
                              onClick={(e) => handleNavigateToDetail(course.id, e)}
                            >
                              <TableCell className="font-medium">{course.course_detail.course_id}</TableCell>
                              <TableCell>{course.course_detail.course_name}</TableCell>
                              <TableCell>
                                {course.teaching_dept_detail.dept_name === course.for_dept_detail.dept_name ? (
                                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                    Self-Taught
                                  </Badge>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <Share2 className="h-3.5 w-3.5 text-amber-500" />
                                    <span>{course.teaching_dept_detail.dept_name}</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={getRelationshipBadgeColor(course.relationship_type?.code || 'UNKNOWN')}
                                >
                                  {getRelationshipShortName(course.relationship_type?.code || 'UNKNOWN', ownedCoursesRole)}
                                </Badge>
                              </TableCell>
                              <TableCell>Year {course.course_year}, Sem {course.course_semester}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    course.teaching_status === 'active' ? 'default' : 
                                    course.teaching_status === 'inactive' ? 'secondary' : 
                                    'outline'
                                  }
                                  className={
                                    course.teaching_status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' :
                                    course.teaching_status === 'inactive' ? 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20' :
                                    'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20'
                                  }
                                >
                                  {course.teaching_status === 'active' ? 'Active' : 
                                   course.teaching_status === 'inactive' ? 'Inactive' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={(e) => handleNavigateToDetail(course.id, e)}
                                  >
                                    View
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teaching to Other Departments Tab */}
            <TabsContent value="teaching">
              <Card>
                <CardHeader className="px-6 py-4 bg-orange-50/50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <School className="h-5 w-5 text-orange-500" />
                      <span>We Teach for Others</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 rounded-full">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p>As the <strong>Teaching Department</strong>, your faculty are responsible for delivering these courses for other departments, even though your department didn't create them.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-0 sm:text-right">
                      {searchQuery ? (
                        <span>
                          Showing {teachingCourses.length} of {allTeachingCourses.length} courses
                          {" "}<Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button>
                        </span>
                      ) : (
                        teachingCoursesDescription
                      )}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">
                            <div className="flex items-center gap-1">
                              Course ID
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead className="whitespace-nowrap">Owning Department</TableHead>
                          <TableHead className="whitespace-nowrap">For Department</TableHead>
                          <TableHead className="whitespace-nowrap">Relationship</TableHead>
                          <TableHead className="whitespace-nowrap">Year & Semester</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isPending ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Loading course data...
                            </TableCell>
                          </TableRow>
                        ) : teachingCourses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {searchQuery ? (
                                <>No courses match your search. <Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button></>
                              ) : (
                                "Your department is not teaching any courses for other departments."
                              )}
                            </TableCell>
                          </TableRow>
                        ) : (
                          teachingCourses.map((course) => (
                            <TableRow 
                              key={course.id} 
                              className="cursor-pointer hover:bg-muted/50" 
                              onClick={(e) => handleNavigateToDetail(course.id, e)}
                            >
                              <TableCell className="font-medium">{course.course_detail.course_id}</TableCell>
                              <TableCell>{course.course_detail.course_name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                                  <span>{course.course_detail.course_dept_detail.dept_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{course.for_dept_detail.dept_name}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={getRelationshipBadgeColor(course.relationship_type?.code || 'UNKNOWN')}
                                >
                                  {getRelationshipShortName(course.relationship_type?.code || 'UNKNOWN', teachingCoursesRole)}
                                </Badge>
                              </TableCell>
                              <TableCell>Year {course.course_year}, Sem {course.course_semester}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    course.teaching_status === 'active' ? 'default' : 
                                    course.teaching_status === 'inactive' ? 'secondary' : 
                                    'outline'
                                  }
                                  className={
                                    course.teaching_status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' :
                                    course.teaching_status === 'inactive' ? 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20' :
                                    'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20'
                                  }
                                >
                                  {course.teaching_status === 'active' ? 'Active' : 
                                   course.teaching_status === 'inactive' ? 'Inactive' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={(e) => handleNavigateToDetail(course.id, e)}
                                  >
                                    View
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Taught by Other Departments Tab */}
            <TabsContent value="receiving">
              <Card>
                <CardHeader className="px-6 py-4 bg-green-50/50 dark:bg-green-950/20 border-b border-green-100 dark:border-green-900/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ArrowLeftRight className="h-5 w-5 text-green-500" />
                      <span>Others Teach Ours</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 rounded-full">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p>Your department is the <strong>Course Owner</strong> but another department is the <strong>Teaching Department</strong>. You maintain the curriculum while they provide faculty.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-0 sm:text-right">
                      {searchQuery ? (
                        <span>
                          Showing {receivingCourses.length} of {allReceivingCourses.length} courses
                          {" "}<Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button>
                        </span>
                      ) : (
                        receivingCoursesDescription
                      )}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">
                            <div className="flex items-center gap-1">
                              Course ID
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead className="whitespace-nowrap">Teaching Department</TableHead>
                          <TableHead className="whitespace-nowrap">Relationship</TableHead>
                          <TableHead className="whitespace-nowrap">Year & Semester</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isPending ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Loading course data...
                            </TableCell>
                          </TableRow>
                        ) : receivingCourses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              {searchQuery ? (
                                <>No courses match your search. <Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button></>
                              ) : (
                                "No courses owned by you are department being taught by other departments."
                              )}
                            </TableCell>
                          </TableRow>
                        ) : (
                          receivingCourses.map((course) => (
                            <TableRow 
                              key={course.id} 
                              className="cursor-pointer hover:bg-muted/50" 
                              onClick={(e) => handleNavigateToDetail(course.id, e)}
                            >
                              <TableCell className="font-medium">{course.course_detail.course_id}</TableCell>
                              <TableCell>{course.course_detail.course_name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <School className="h-3.5 w-3.5 text-orange-500" />
                                  <span>{course.teaching_dept_detail.dept_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={getRelationshipBadgeColor(course.relationship_type?.code || 'UNKNOWN')}
                                >
                                  {getRelationshipShortName(course.relationship_type?.code || 'UNKNOWN', receivingCoursesRole)}
                                </Badge>
                              </TableCell>
                              <TableCell>Year {course.course_year}, Sem {course.course_semester}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    course.teaching_status === 'active' ? 'default' : 
                                    course.teaching_status === 'inactive' ? 'secondary' : 
                                    'outline'
                                  }
                                  className={
                                    course.teaching_status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' :
                                    course.teaching_status === 'inactive' ? 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20' :
                                    'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20'
                                  }
                                >
                                  {course.teaching_status === 'active' ? 'Active' : 
                                   course.teaching_status === 'inactive' ? 'Inactive' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={(e) => handleNavigateToDetail(course.id, e)}
                                  >
                                    View
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses For Our Department's Students Tab */}
            <TabsContent value="fordept">
              <Card>
                <CardHeader className="px-6 py-4 bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-purple-500" />
                      <span>For Our Students</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 rounded-full">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p>Your department is the <strong>For Students</strong> department. These courses are created and taught by other departments, but your students take them as part of their curriculum.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                    <CardDescription className="mt-1 sm:mt-0 sm:text-right">
                      {searchQuery ? (
                        <span>
                          Showing {forDeptCourses.length} of {allForDeptCourses.length} courses
                          {" "}<Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button>
                        </span>
                      ) : (
                        forDeptCoursesDescription
                      )}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">
                            <div className="flex items-center gap-1">
                              Course ID
                              <ArrowUpDown className="h-3 w-3" />
                            </div>
                          </TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead className="whitespace-nowrap">Owning Department</TableHead>
                          <TableHead className="whitespace-nowrap">Teaching Department</TableHead>
                          <TableHead className="whitespace-nowrap">Relationship</TableHead>
                          <TableHead className="whitespace-nowrap">Year & Semester</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isPending ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Loading course data...
                            </TableCell>
                          </TableRow>
                        ) : forDeptCourses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {searchQuery ? (
                                <>No courses match your search. <Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button></>
                              ) : (
                                "No external courses are being taught to your department's students."
                              )}
                            </TableCell>
                          </TableRow>
                        ) : (
                          forDeptCourses.map((course) => (
                            <TableRow 
                              key={course.id} 
                              className="cursor-pointer hover:bg-muted/50" 
                              onClick={(e) => handleNavigateToDetail(course.id, e)}
                            >
                              <TableCell className="font-medium">{course.course_detail.course_id}</TableCell>
                              <TableCell>{course.course_detail.course_name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                                  <span>{course.course_detail.course_dept_detail.dept_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <School className="h-3.5 w-3.5 text-orange-500" />
                                  <span>{course.teaching_dept_detail.dept_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline"
                                  className={getRelationshipBadgeColor(course.relationship_type?.code || 'UNKNOWN')}
                                >
                                  {getRelationshipShortName(course.relationship_type?.code || 'UNKNOWN', forDeptCoursesRole)}
                                </Badge>
                              </TableCell>
                              <TableCell>Year {course.course_year}, Sem {course.course_semester}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    course.teaching_status === 'active' ? 'default' : 
                                    course.teaching_status === 'inactive' ? 'secondary' : 
                                    'outline'
                                  }
                                  className={
                                    course.teaching_status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' :
                                    course.teaching_status === 'inactive' ? 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20' :
                                    'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20'
                                  }
                                >
                                  {course.teaching_status === 'active' ? 'Active' : 
                                   course.teaching_status === 'inactive' ? 'Inactive' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={(e) => handleNavigateToDetail(course.id, e)}
                                  >
                                    View
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Course Selection Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Course</DialogTitle>
            <DialogDescription>
              Create a new course instance for your curriculum
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
          <div className="mb-2">
            <h3 className="text-sm font-medium mb-3">Select an option:</h3>
            <RadioGroup 
              defaultValue={courseCreationOption} 
              value={courseCreationOption} 
              onValueChange={(value) => handleCourseCreationOptionChange(value as 'select' | 'create')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="select" id="select-option" />
                <label htmlFor="select-option" className="text-sm cursor-pointer">
                  Select from existing course catalog
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="create" id="create-option" />
                <label htmlFor="create-option" className="text-sm cursor-pointer">
                  Create a new course in the catalog
                </label>
              </div>
            </RadioGroup>
          </div>
            <CourseForm
              departments={departments}
              courseMasters={courseMasters}
              isLoading={isCreating}
              onSubmit={handleCreateCourse}
              onCancel={() => setShowAddDialog(false)}
              submitLabel="Create Course"
              defaultValues={{
                for_dept_id: currentDepartment?.id,
                teaching_dept_id: currentDepartment?.id
              }}
              editableFields={['course_id', 'course_year', 'course_semester', 'lecture_hours', 'tutorial_hours', 'practical_hours', 'credits', 'for_dept_id', 'need_assist_teacher', 'regulation', 'course_type', 'elective_type', 'lab_type', 'no_of_students', 'is_zero_credit_course', 'teaching_status']}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Course Master Creation Dialog */}
      <Dialog open={showAddCourseMasterDialog} onOpenChange={setShowAddCourseMasterDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Course to Catalog</DialogTitle>
            <DialogDescription>
              Create a new course in the course catalog
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            <CourseMasterForm
              departments={departments}
              defaultValues={defaultDeptId ? { course_dept_id: defaultDeptId } : undefined}
              isLoading={isCreatingCourseMaster}
              onSubmit={handleCreateCourseMaster}
              onCancel={() => setShowAddCourseMasterDialog(false)}
              submitLabel="Create Course Master"
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
} 