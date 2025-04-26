import { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { 
  useGetCurrentDepartmentCourses, 
  useCreateCourse,
  Course 
} from '@/action/course';
import { useGetDepartments } from '@/action/department';
import { useGetCourseMasters } from '@/action/courseMaster'
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

// Helper function to get relationship badge color
const getRelationshipBadgeColor = (relationshipCode: string) => {
  switch (relationshipCode) {
    case 'SELF_OWNED_SELF_TAUGHT':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'SELF_OWNED_OTHER_TAUGHT':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'OTHER_OWNED_SELF_TAUGHT':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'OTHER_OWNED_OTHER_TAUGHT':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'SELF_OWNED_FOR_OTHER_SELF_TAUGHT':
      return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    case 'SELF_OWNED_FOR_OTHER_OTHER_TAUGHT':
      return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

// Helper function to get a short display name for relationship
const getRelationshipShortName = (relationshipCode: string) => {
  switch (relationshipCode) {
    case 'SELF_OWNED_SELF_TAUGHT':
      return 'Self-Managed';
    case 'SELF_OWNED_OTHER_TAUGHT':
      return 'Outsourced Teaching';
    case 'OTHER_OWNED_SELF_TAUGHT':
      return 'Teaching for Others';
    case 'OTHER_OWNED_OTHER_TAUGHT':
      return 'External Course';
    case 'SELF_OWNED_FOR_OTHER_SELF_TAUGHT':
      return 'Providing Course';
    case 'SELF_OWNED_FOR_OTHER_OTHER_TAUGHT':
      return 'Complex Sharing';
    default:
      return 'Unknown';
  }
};

export default function CourseManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const navigate = useNavigate();
  
  const { data: departmentData, isPending, refetch } = useGetCurrentDepartmentCourses();
  const { data: departmentsData, isPending: loadingDepartments } = useGetDepartments();
  const { data: courseMastersData, isPending: loadingCourseMasters } = useGetCourseMasters();
  
  const departments = departmentsData || [];
  const courseMasters = courseMastersData || [];
  
  const ownedCourses = departmentData?.owned_courses || [];
  const teachingCourses = departmentData?.teaching_courses || [];
  const receivingCourses = departmentData?.receiving_courses || [];
  
  // Create course mutation
  const { mutate: createCourse, isPending: isCreating } = useCreateCourse(() => {
    refetch();
    toast.success("Course created successfully");
    setShowAddDialog(false);
  });
  
  const handleCreateCourse = (values: CourseFormValues) => {
    createCourse(values);
  };
  
  const handleNavigateToDetail = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="px-6">
          <div className="flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Course Management Dashboard</CardTitle>
          </div>
          <CardDescription>
            Manage courses owned by your department, courses you teach for others, and courses taught to your department
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <Tabs defaultValue="owned">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="owned" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Department-Owned Courses</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {ownedCourses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="teaching" className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  <span>Teaching for Others</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {teachingCourses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="receiving" className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>Externally Taught Courses</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {receivingCourses.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search courses..."
                    className="pl-8 w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="flex gap-2 items-center" onClick={() => setShowAddDialog(true)}>
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Course</span>
                </Button>
              </div>
            </div>
            
            {/* Owned Courses Tab */}
            <TabsContent value="owned">
              <Card>
                <CardHeader className="px-6 py-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Courses Owned by Your Department
                    </CardTitle>
                    <CardDescription>
                      Manage all courses created and maintained by your department
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">
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
                            No owned courses found. Create your first course.
                          </TableCell>
                        </TableRow>
                      ) : (
                        ownedCourses.map((course) => (
                          <TableRow 
                            key={course.id} 
                            className="cursor-pointer hover:bg-muted/50" 
                            onClick={() => handleNavigateToDetail(course.id)}
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
                                {getRelationshipShortName(course.relationship_type?.code || 'UNKNOWN')}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigateToDetail(course.id);
                                  }}
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teaching to Other Departments Tab */}
            <TabsContent value="teaching">
              <Card>
                <CardHeader className="px-6 py-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <School className="h-5 w-5 text-primary" />
                      Courses Your Department Teaches
                    </CardTitle>
                    <CardDescription>
                      Courses where your department is responsible for teaching, but may be owned by other departments
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">
                          <div className="flex items-center gap-1">
                            Course ID
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Owning Department</TableHead>
                        <TableHead>For Department</TableHead>
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
                      ) : teachingCourses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Your department is not teaching any courses for other departments.
                          </TableCell>
                        </TableRow>
                      ) : (
                        teachingCourses.map((course) => (
                          <TableRow 
                            key={course.id} 
                            className="cursor-pointer hover:bg-muted/50" 
                            onClick={() => handleNavigateToDetail(course.id)}
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
                                {getRelationshipShortName(course.relationship_type?.code || 'UNKNOWN')}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigateToDetail(course.id);
                                  }}
                                >
                                  View
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <BookOpenCheck className="h-3.5 w-3.5" />
                                  <span>Assign Teachers</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Taught by Other Departments Tab */}
            <TabsContent value="receiving">
              <Card>
                <CardHeader className="px-6 py-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ArrowLeftRight className="h-5 w-5 text-primary" />
                      Courses Taught by External Departments
                    </CardTitle>
                    <CardDescription>
                      Courses that your department owns or participates in, but are taught by other departments
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">
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
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Loading course data...
                          </TableCell>
                        </TableRow>
                      ) : receivingCourses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No courses are being taught to your department by other departments.
                          </TableCell>
                        </TableRow>
                      ) : (
                        receivingCourses.map((course) => (
                          <TableRow 
                            key={course.id} 
                            className="cursor-pointer hover:bg-muted/50" 
                            onClick={() => handleNavigateToDetail(course.id)}
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
                                {getRelationshipShortName(course.relationship_type?.code || 'UNKNOWN')}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigateToDetail(course.id);
                                  }}
                                >
                                  View
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  className="flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ArrowLeftRight className="h-3.5 w-3.5" />
                                  <span>Request Change</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Add Course Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px] overflow-hidden">       
          <ScrollArea className='h-[600px]'>
 
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Add New Course
            </DialogTitle>
            <DialogDescription>
              Create a new course offering for your department
            </DialogDescription>
          </DialogHeader>
          
          <CourseForm 
            departments={departments}
            courseMasters={courseMasters}
            isLoading={isCreating || loadingDepartments || loadingCourseMasters}
            onSubmit={handleCreateCourse}
            onCancel={() => setShowAddDialog(false)}
            submitLabel="Create Course"
          />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
} 