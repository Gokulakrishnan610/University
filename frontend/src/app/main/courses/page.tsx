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
  ListFilter
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
            Manage courses for your department, including those you teach and those your students take
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          {/* Department Role Information - Simplified */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Course Management Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <div>
                  <span className="font-medium">We Own</span>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Courses created and owned by our department
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <School className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                <div>
                  <span className="font-medium">We Teach</span>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Courses we teach for other departments
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ArrowLeftRight className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <div>
                  <span className="font-medium">Others Teach Ours</span>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Our courses taught by other departments
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <GraduationCap className="h-4 w-4 mt-0.5 text-purple-500 flex-shrink-0" />
                <div>
                  <span className="font-medium">Our Students Take</span>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    External courses taken by our students
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="owned">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="flex flex-wrap h-auto p-1">
                <TabsTrigger value="owned" className="flex items-center gap-1 h-9 px-3 py-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">We Own</span>
                  <span className="inline sm:hidden">We Own</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {ownedCourses.length}/{allOwnedCourses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="teaching" className="flex items-center gap-1 h-9 px-3 py-1">
                  <School className="h-4 w-4" />
                  <span className="hidden sm:inline">We Teach</span>
                  <span className="inline sm:hidden">We Teach</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {teachingCourses.length}/{allTeachingCourses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="receiving" className="flex items-center gap-1 h-9 px-3 py-1">
                  <ArrowLeftRight className="h-4 w-4" />
                  <span className="hidden sm:inline">Others Teach Ours</span>
                  <span className="inline sm:hidden">Others Teach</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {receivingCourses.length}/{allReceivingCourses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="fordept" className="flex items-center gap-1 h-9 px-3 py-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Our Students Take</span>
                  <span className="inline sm:hidden">Students Take</span>
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
                <CardHeader className="px-6 py-4 bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Courses We Own
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
                <CardHeader className="px-6 py-4 bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <School className="h-5 w-5 text-primary" />
                      Courses We Teach (For Other Departments)
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
                <CardHeader className="px-6 py-4 bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ArrowLeftRight className="h-5 w-5 text-primary" />
                      Our Courses Taught By Other Departments
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
                                  <School className="h-3.5 w-3.5 text-indigo-500" />
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
                <CardHeader className="px-6 py-4 bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      External Courses Our Students Take
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
                                  <School className="h-3.5 w-3.5 text-indigo-500" />
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