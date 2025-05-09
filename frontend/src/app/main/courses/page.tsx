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
  CircleDot,
  Bell,
  ChevronDown
} from 'lucide-react';
import {
  useGetCurrentDepartmentCourses,
  Course,
  CourseMaster
} from '@/action/course';
import { useGetDepartments, useGetCurrentDepartment } from '@/action/department';
import { getRelationshipBadgeColor, getRelationshipShortName } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CourseNotifications } from './course-notifications';
import { useGetCourseNotifications } from '@/action/course';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

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

// After the StatCard component, add this new component
interface RelationshipTagProps {
  ownerDept: string;
  teacherDept: string;
  forDept: string;
  currentDeptId: number;
  ownerDeptId: number;
  teacherDeptId: number;
  forDeptId: number;
}

const RelationshipTag = ({
  ownerDept,
  teacherDept,
  forDept,
  currentDeptId,
  ownerDeptId,
  teacherDeptId,
  forDeptId
}: RelationshipTagProps) => {
  // Case 1: We own, other dept teaches for their students
  if (ownerDeptId === currentDeptId && teacherDeptId !== currentDeptId && forDeptId === teacherDeptId) {
    return (
      <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300">
        <div className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          <span>We own, {teacherDept} teaches for their students</span>
        </div>
      </Badge>
    );
  }

  // Case 2: We own, we teach for our students (self-owned, self-taught)
  if (ownerDeptId === currentDeptId && teacherDeptId === currentDeptId && forDeptId === currentDeptId) {
    return (
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
        <div className="flex items-center gap-1">
          <CircleDot className="h-3 w-3" />
          <span>We own, teach and take this course</span>
        </div>
      </Badge>
    );
  }

  // Case 3: We own, we teach for other department's students
  if (ownerDeptId === currentDeptId && teacherDeptId === currentDeptId && forDeptId !== currentDeptId) {
    return (
      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300">
        <div className="flex items-center gap-1">
          <School className="h-3 w-3" />
          <span>We own and teach for {forDept} students</span>
        </div>
      </Badge>
    );
  }

  // Case 4: Other dept owns and teaches for our students
  if (ownerDeptId !== currentDeptId && teacherDeptId === ownerDeptId && forDeptId === currentDeptId) {
    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300">
        <div className="flex items-center gap-1">
          <GraduationCap className="h-3 w-3" />
          <span>{ownerDept} owns and teaches for our students</span>
        </div>
      </Badge>
    );
  }

  // Case 5: Other dept owns, we teach for our students
  if (ownerDeptId !== currentDeptId && teacherDeptId === currentDeptId && forDeptId === currentDeptId) {
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300">
        <div className="flex items-center gap-1">
          <ArrowLeftRight className="h-3 w-3" />
          <span>We teach {ownerDept}'s course for our students</span>
        </div>
      </Badge>
    );
  }

  // Case 6: Other dept owns, we teach for their students
  if (ownerDeptId !== currentDeptId && teacherDeptId === currentDeptId && forDeptId !== currentDeptId) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300">
        <div className="flex items-center gap-1">
          <Share2 className="h-3 w-3" />
          <span>We teach {ownerDept}'s course for {forDept} students</span>
        </div>
      </Badge>
    );
  }

  // Default case
  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300">
      <div className="flex items-center gap-1">
        <Info className="h-3 w-3" />
        <span>Other relationship</span>
      </div>
    </Badge>
  );
};

// Create a new compact relationship component after RelationshipTag
interface CompactRelationshipTagProps {
  ownerDept: string;
  teacherDept: string;
  forDept: string;
  currentDeptId: number;
  ownerDeptId: number;
  teacherDeptId: number;
  forDeptId: number;
}

const CompactRelationshipTag = ({
  ownerDept,
  teacherDept,
  forDept,
  currentDeptId,
  ownerDeptId,
  teacherDeptId,
  forDeptId
}: CompactRelationshipTagProps) => {
  // Case 1: We own, other dept teaches for their students
  if (ownerDeptId === currentDeptId && teacherDeptId !== currentDeptId && forDeptId === teacherDeptId) {
    return (
      <div className="flex items-center gap-1">
        <BookOpen className="h-3.5 w-3.5 text-teal-500" />
        <span className="text-xs">{teacherDept} teaches for their students</span>
      </div>
    );
  }

  // Case 2: We own, we teach for our students (self-owned, self-taught)
  if (ownerDeptId === currentDeptId && teacherDeptId === currentDeptId && forDeptId === currentDeptId) {
    return (
      <div className="flex items-center gap-1">
        <CircleDot className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs">Self-owned, self-taught, for our students</span>
      </div>
    );
  }

  // Case 3: We own, we teach for other department's students
  if (ownerDeptId === currentDeptId && teacherDeptId === currentDeptId && forDeptId !== currentDeptId) {
    return (
      <div className="flex items-center gap-1">
        <School className="h-3.5 w-3.5 text-indigo-500" />
        <span className="text-xs">We teach for {forDept} students</span>
      </div>
    );
  }

  // Case 4: Other dept owns and teaches for our students
  if (ownerDeptId !== currentDeptId && teacherDeptId === ownerDeptId && forDeptId === currentDeptId) {
    return (
      <div className="flex items-center gap-1">
        <GraduationCap className="h-3.5 w-3.5 text-purple-500" />
        <span className="text-xs">{ownerDept} teaches for our students</span>
      </div>
    );
  }

  // Case 5: Other dept owns, we teach for our students
  if (ownerDeptId !== currentDeptId && teacherDeptId === currentDeptId && forDeptId === currentDeptId) {
    return (
      <div className="flex items-center gap-1">
        <ArrowLeftRight className="h-3.5 w-3.5 text-orange-500" />
        <span className="text-xs">We teach {ownerDept}'s course for our students</span>
      </div>
    );
  }

  // Case 6: Other dept owns, we teach for their students
  if (ownerDeptId !== currentDeptId && teacherDeptId === currentDeptId && forDeptId !== currentDeptId) {
    return (
      <div className="flex items-center gap-1">
        <Share2 className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-xs">We teach {ownerDept}'s course for {forDept} students</span>
      </div>
    );
  }

  // Default case
  return (
    <div className="flex items-center gap-1">
      <Info className="h-3.5 w-3.5 text-gray-500" />
      <span className="text-xs">Other relationship</span>
    </div>
  );
};

// First, let's add proper type definitions for grouped courses
interface GroupedCourse {
  courseDetail: CourseMaster;
  instances: Course[];
}

export default function CourseManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCourseMasterDialog, setShowAddCourseMasterDialog] = useState(false);
  const [defaultDeptId, setDefaultDeptId] = useState<number | undefined>(undefined);
  const navigate = useNavigate();

  // Add scroll restoration
  useScrollRestoration('courses-page');

  const { data: departmentData, isPending, refetch } = useGetCurrentDepartmentCourses();
  const { data: departmentsData, isPending: loadingDepartments } = useGetDepartments();
  const { data: currentDepartment, isPending: loadingCurrentDept } = useGetCurrentDepartment();
  const { data: courseNotifications } = useGetCourseNotifications();

  const notificationCount = courseNotifications?.data?.length || 0;

  const departments = departmentsData || [];

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

  // Filter courses based on selected relationship type
  const filterByRelationship = (course: Course, currentDeptId: number | undefined, relationshipFilter: string) => {
    if (relationshipFilter === 'all') return true;

    const ownerDeptId = course.course_detail.course_dept_detail.id;
    const teacherDeptId = course.teaching_dept_detail.id;
    const forDeptId = course.for_dept_detail.id;

    switch (relationshipFilter) {
      case 'self-owned-self-taught':
        return ownerDeptId === currentDeptId &&
          teacherDeptId === currentDeptId;
      // Note: We've removed the forDeptId check to include both cases 
      // where courses are taught for our own students or others' students
      case 'own-teach-others':
        return ownerDeptId === currentDeptId &&
          teacherDeptId === currentDeptId &&
          forDeptId !== currentDeptId;
      case 'own-others-teach':
        return ownerDeptId === currentDeptId &&
          teacherDeptId !== currentDeptId;
      case 'others-own-we-teach-for-us':
        return ownerDeptId !== currentDeptId &&
          teacherDeptId === currentDeptId &&
          forDeptId === currentDeptId;
      case 'others-own-we-teach-for-them':
        return ownerDeptId !== currentDeptId &&
          teacherDeptId === currentDeptId &&
          forDeptId !== currentDeptId;
      case 'others-own-teach':
        return ownerDeptId !== currentDeptId &&
          teacherDeptId !== currentDeptId &&
          forDeptId === currentDeptId;
      default:
        return true;
    }
  };

  // Get role descriptions
  const ownedCoursesRole = departmentData?.owned_courses?.role || 'owner';
  const teachingCoursesRole = departmentData?.teaching_courses?.role || 'teacher';
  const receivingCoursesRole = departmentData?.receiving_courses?.role || 'owner_not_teacher';
  const forDeptCoursesRole = departmentData?.for_dept_courses?.role || 'learner';

  // Get descriptions
  const ownedCoursesDescription = departmentData?.owned_courses?.description || 'Courses created and maintained by our department';
  const teachingCoursesDescription = departmentData?.teaching_courses?.description || 'Courses our department teaches, including both courses we own and courses from other departments';
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

  // Group owned courses by course master ID
  const groupedOwnedCourses = useMemo(() => {
    const grouped: Record<number, GroupedCourse> = {};

    // First, group the courses by course master ID
    ownedCourses.forEach(course => {
      const masterID = course.course_detail.id;
      if (!grouped[masterID]) {
        grouped[masterID] = {
          courseDetail: course.course_detail,
          instances: []
        };
      }

      grouped[masterID].instances.push(course);
    });

    return Object.values(grouped);
  }, [ownedCourses]);

  // Group teaching courses by course master ID
  const groupedTeachingCourses = useMemo(() => {
    const grouped: Record<number, GroupedCourse> = {};

    // Group by course master ID
    teachingCourses.forEach(course => {
      const masterID = course.course_detail.id;
      if (!grouped[masterID]) {
        grouped[masterID] = {
          courseDetail: course.course_detail,
          instances: []
        };
      }

      grouped[masterID].instances.push(course);
    });

    return Object.values(grouped);
  }, [teachingCourses]);

  // Group receiving courses by course master ID
  const groupedReceivingCourses = useMemo(() => {
    const grouped: Record<number, GroupedCourse> = {};

    // Group by course master ID
    receivingCourses.forEach(course => {
      const masterID = course.course_detail.id;
      if (!grouped[masterID]) {
        grouped[masterID] = {
          courseDetail: course.course_detail,
          instances: []
        };
      }

      grouped[masterID].instances.push(course);
    });

    return Object.values(grouped);
  }, [receivingCourses]);

  // Group forDept courses by course master ID
  const groupedForDeptCourses = useMemo(() => {
    const grouped: Record<number, GroupedCourse> = {};

    // Group by course master ID
    forDeptCourses.forEach(course => {
      const masterID = course.course_detail.id;
      if (!grouped[masterID]) {
        grouped[masterID] = {
          courseDetail: course.course_detail,
          instances: []
        };
      }

      grouped[masterID].instances.push(course);
    });

    return Object.values(grouped);
  }, [forDeptCourses]);

  const handleNavigateToCreateCourse = () => {
    navigate('/courses/create');
  };

  const handleOpenCreateCourseMasterDialog = () => {
    setShowAddCourseMasterDialog(true);
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

  // Now let's add a dropdown for relationship types
  // First, define the relationship types
  interface RelationshipType {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }

  const relationshipTypes: RelationshipType[] = [
    {
      id: 'self-owned-self-taught',
      name: 'Self-Owned & Self-Taught',
      description: 'We both own and teach these courses (may be for our students or others)',
      icon: <CircleDot className="h-4 w-4" />,
      color: 'bg-primary/10 text-primary border-primary/20'
    },
    {
      id: 'own-teach-others',
      name: 'We Teach Our Course for Others',
      description: "We own and teach for another department's students",
      icon: <School className="h-4 w-4 text-indigo-500" />,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300'
    },
    {
      id: 'own-others-teach',
      name: 'Others Teach Our Course',
      description: 'We own, another department teaches for their students',
      icon: <BookOpen className="h-4 w-4 text-teal-500" />,
      color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300'
    },
    {
      id: 'others-own-we-teach-for-us',
      name: "We Teach Others' Course for Us",
      description: "We teach another department's course for our students",
      icon: <ArrowLeftRight className="h-4 w-4 text-orange-500" />,
      color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300'
    },
    {
      id: 'others-own-we-teach-for-them',
      name: "We Teach Others' Course for Them",
      description: "We teach another department's course for their students",
      icon: <Share2 className="h-4 w-4 text-amber-500" />,
      color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300'
    },
    {
      id: 'others-own-teach',
      name: 'Others Teach Their Course for Us',
      description: 'Another department owns and teaches a course for our students',
      icon: <GraduationCap className="h-4 w-4 text-purple-500" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300'
    }
  ];

  // Add this after the departmental role summary section, before the tabs
  const [selectedRelationshipFilter, setSelectedRelationshipFilter] = useState<string>('all');

  // Add this right after the course role definitions section
  <div className="mb-6 p-4 bg-muted/30 rounded-lg">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
      <h3 className="text-sm font-medium flex items-center gap-2 mb-2 md:mb-0">
        <Info className="h-4 w-4 text-primary" />
        Course Relationship Types
      </h3>

      <div className="flex gap-2 items-center">
        <Label htmlFor="relationshipFilter" className="text-sm whitespace-nowrap">Filter by type:</Label>
        <Select value={selectedRelationshipFilter} onValueChange={setSelectedRelationshipFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All relationships" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All relationships</SelectItem>
            {relationshipTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>
                <div className="flex items-center gap-2">
                  {type.icon}
                  <span>{type.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
      {relationshipTypes.map(type => (
        <div
          key={type.id}
          className={`rounded-lg p-3 border ${selectedRelationshipFilter === type.id ? 'ring-2 ring-primary/20' : ''
            }`}
          onClick={() => setSelectedRelationshipFilter(
            selectedRelationshipFilter === type.id ? 'all' : type.id
          )}
        >
          <div className="flex items-start gap-2">
            <div className={`p-2 rounded-full ${type.color} mt-1`}>
              {type.icon}
            </div>
            <div>
              <h4 className="font-medium">{type.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {type.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  // Filter the groups based on selected relationship type
  // Add this to the TabsContent for the owned courses tab
  {
    isPending ? (
      <div className="text-center py-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p>Loading course data...</p>
      </div>
    ) : groupedOwnedCourses.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground">
        {searchQuery ? (
          <>No courses match your search. <Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button></>
        ) : (
          "No owned courses found. Create your first course."
        )}
      </div>
    ) : (
      <div className="space-y-4 p-4">
        {groupedOwnedCourses
          .filter(groupedCourse => {
            if (selectedRelationshipFilter === 'all') return true;

            if (groupedCourse.instances.length === 0) return false;
            const course = groupedCourse.instances[0];

            return filterByRelationship(course, currentDepartment?.id, selectedRelationshipFilter);
          })
          .map((groupedCourse) => (
            <Card key={groupedCourse.courseDetail.id} className="overflow-hidden border-blue-100 dark:border-blue-900/40 shadow-sm">
              <CardHeader className="bg-blue-50/50 dark:bg-blue-950/30 px-6 py-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="font-medium text-base">
                          {groupedCourse.courseDetail.course_id}: {groupedCourse.courseDetail.course_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {groupedCourse.courseDetail.credits} credits • {
                            groupedCourse.courseDetail.course_type === 'T' ? 'Theory' :
                              groupedCourse.courseDetail.course_type === 'L' ? 'Lab' :
                                'Lab & Theory'
                          } • Regulation: {groupedCourse.courseDetail.regulation}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-100/50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                      {groupedCourse.instances.length} instances
                    </Badge>
                  </div>

                  {groupedCourse.instances.length > 0 && (
                    <RelationshipTag
                      ownerDept={groupedCourse.courseDetail.course_dept_detail.dept_name}
                      teacherDept={groupedCourse.instances[0].teaching_dept_detail.dept_name}
                      forDept={groupedCourse.instances[0].for_dept_detail.dept_name}
                      currentDeptId={currentDepartment?.id || 0}
                      ownerDeptId={groupedCourse.courseDetail.course_dept_detail.id}
                      teacherDeptId={groupedCourse.instances[0].teaching_dept_detail.id}
                      forDeptId={groupedCourse.instances[0].for_dept_detail.id}
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-0 py-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teaching Department</TableHead>
                      <TableHead>For Students Of</TableHead>
                      <TableHead>Year & Semester</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedCourse.instances.map((course) => (
                      <TableRow
                        key={course.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={(e) => handleNavigateToDetail(course.id, e)}
                      >
                        <TableCell>
                          {course.teaching_dept_detail.id === currentDepartment?.id ? (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400">
                              Self-Taught
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-1">
                              <School className="h-3.5 w-3.5 text-orange-500" />
                              <span>{course.teaching_dept_detail.dept_name}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {course.for_dept_detail.id === currentDepartment?.id ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400">
                              Our Students
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5 text-purple-500" />
                              <span>{course.for_dept_detail.dept_name}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>Year {course.course_year}, Sem {course.course_semester}</TableCell>
                        <TableCell>
                          <CompactRelationshipTag
                            ownerDept={course.course_detail.course_dept_detail.dept_name}
                            teacherDept={course.teaching_dept_detail.dept_name}
                            forDept={course.for_dept_detail.dept_name}
                            currentDeptId={currentDepartment?.id || 0}
                            ownerDeptId={course.course_detail.course_dept_detail.id}
                            teacherDeptId={course.teaching_dept_detail.id}
                            forDeptId={course.for_dept_detail.id}
                          />
                        </TableCell>
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleNavigateToDetail(course.id, e)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

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
              <Button variant="outline" onClick={() => navigate('/course-masters')}>
                <BookOpen className="h-4 w-4" />
                <span>Course Catalog</span>
              </Button>
            </div>
          </div>
          <CardDescription>
            Manage courses for your department, including those you own, teach, and your students take
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          {/* Department Role Dashboard - More Compact */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
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
                description="Courses taught by your faculty (includes both your own and others' courses)"
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

          {/* Department Role Information - Collapsible */}
          <div className="mb-6">
            <Collapsible className="p-2 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Course Role Definitions</h3>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                    <ChevronDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-2">
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
                              Department providing faculty to teach courses (includes own and others')
                            </p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p>The <strong>Teaching Department</strong> provides faculty to teach courses. This includes both courses your department owns and teaches itself (self-taught) and courses owned by other departments.</p>
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
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Replace the previous Course Relationship Types section with this collapsible version */}
          <div className="mb-6">
            <Collapsible className="p-2 bg-muted/30 rounded-lg border">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Course Relationship Types</h3>
                </div>

                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <Label htmlFor="relationshipFilter" className="text-sm whitespace-nowrap hidden md:inline">Filter by type:</Label>
                  <Select value={selectedRelationshipFilter} onValueChange={setSelectedRelationshipFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All relationships" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All relationships</SelectItem>
                      {relationshipTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      <ChevronDown className="h-4 w-4" />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {relationshipTypes.map(type => (
                    <div
                      key={type.id}
                      className={`rounded-lg p-3 border ${selectedRelationshipFilter === type.id ? 'ring-2 ring-primary/20' : ''
                        }`}
                      onClick={() => setSelectedRelationshipFilter(
                        selectedRelationshipFilter === type.id ? 'all' : type.id
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`p-2 rounded-full ${type.color} mt-1`}>
                          {type.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{type.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <Tabs defaultValue="owned">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="flex flex-wrap h-auto p-1">
                <TabsTrigger value="owned" className="flex items-center gap-1 h-9 px-3 py-1">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="hidden sm:inline">Courses We Own</span>
                  <span className="inline sm:hidden">We Own</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {ownedCourses.length}/{allOwnedCourses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="teaching" className="flex items-center gap-1 h-9 px-3 py-1">
                  <School className="h-4 w-4 text-orange-500" />
                  <span className="hidden sm:inline">Courses We Teach</span>
                  <span className="inline sm:hidden">We Teach</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {teachingCourses.length}/{allTeachingCourses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="receiving" className="flex items-center gap-1 h-9 px-3 py-1">
                  <ArrowLeftRight className="h-4 w-4 text-green-500" />
                  <span className="hidden sm:inline">Others Teach Our Courses</span>
                  <span className="inline sm:hidden">Others Teach</span>
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 rounded-full">
                    {receivingCourses.length}/{allReceivingCourses.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="fordept" className="flex items-center gap-1 h-9 px-3 py-1">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  <span className="hidden sm:inline">Courses For Our Students</span>
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
                <Button className="flex gap-2 items-center whitespace-nowrap" onClick={handleNavigateToCreateCourse}>
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
                            <p>As the <strong>Course Owner</strong>, your department has created these courses and controls their content, curriculum, and academic standards. This view groups courses by course master and shows all teaching arrangements.</p>
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
                    {isPending ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p>Loading course data...</p>
                      </div>
                    ) : groupedOwnedCourses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery ? (
                          <>No courses match your search. <Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button></>
                        ) : (
                          "No owned courses found. Create your first course."
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 p-4">
                        {groupedOwnedCourses
                          .filter(groupedCourse => {
                            if (selectedRelationshipFilter === 'all') return true;

                            // Get the first instance to check relationship type
                            if (groupedCourse.instances.length === 0) return false;
                            const course = groupedCourse.instances[0];

                            // Check which relationship type matches
                            const ownerDeptId = course.course_detail.course_dept_detail.id;
                            const teacherDeptId = course.teaching_dept_detail.id;
                            const forDeptId = course.for_dept_detail.id;

                            switch (selectedRelationshipFilter) {
                              case 'self-owned-self-taught':
                                return ownerDeptId === currentDepartment?.id &&
                                  teacherDeptId === currentDepartment?.id;
                              case 'own-teach-others':
                                return ownerDeptId === currentDepartment?.id &&
                                  teacherDeptId === currentDepartment?.id &&
                                  forDeptId !== currentDepartment?.id;
                              case 'own-others-teach':
                                return ownerDeptId === currentDepartment?.id &&
                                  teacherDeptId !== currentDepartment?.id;
                              case 'others-own-we-teach-for-us':
                                return ownerDeptId !== currentDepartment?.id &&
                                  teacherDeptId === currentDepartment?.id &&
                                  forDeptId === currentDepartment?.id;
                              case 'others-own-we-teach-for-them':
                                return ownerDeptId !== currentDepartment?.id &&
                                  teacherDeptId === currentDepartment?.id &&
                                  forDeptId !== currentDepartment?.id;
                              case 'others-own-teach':
                                return ownerDeptId !== currentDepartment?.id &&
                                  teacherDeptId !== currentDepartment?.id &&
                                  forDeptId === currentDepartment?.id;
                              default:
                                return true;
                            }
                          })
                          .map((groupedCourse) => (
                            <Card key={groupedCourse.courseDetail.id} className="overflow-hidden border-blue-100 dark:border-blue-900/40 shadow-sm">
                              <CardHeader className="bg-blue-50/50 dark:bg-blue-950/30 px-6 py-3">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <BookOpen className="h-5 w-5 text-blue-500" />
                                      <div>
                                        <h3 className="font-medium text-base">
                                          {groupedCourse.courseDetail.course_id}: {groupedCourse.courseDetail.course_name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          {groupedCourse.courseDetail.credits} credits • {
                                            groupedCourse.courseDetail.course_type === 'T' ? 'Theory' :
                                              groupedCourse.courseDetail.course_type === 'L' ? 'Lab' :
                                                'Lab & Theory'
                                          } • Regulation: {groupedCourse.courseDetail.regulation}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="bg-blue-100/50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                      {groupedCourse.instances.length} instances
                                    </Badge>
                                  </div>

                                  {groupedCourse.instances.length > 0 && (
                                    <RelationshipTag
                                      ownerDept={groupedCourse.courseDetail.course_dept_detail.dept_name}
                                      teacherDept={groupedCourse.instances[0].teaching_dept_detail.dept_name}
                                      forDept={groupedCourse.instances[0].for_dept_detail.dept_name}
                                      currentDeptId={currentDepartment?.id || 0}
                                      ownerDeptId={groupedCourse.courseDetail.course_dept_detail.id}
                                      teacherDeptId={groupedCourse.instances[0].teaching_dept_detail.id}
                                      forDeptId={groupedCourse.instances[0].for_dept_detail.id}
                                    />
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="px-0 py-0">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Teaching Department</TableHead>
                                      <TableHead>For Students Of</TableHead>
                                      <TableHead>Year & Semester</TableHead>
                                      <TableHead>Relationship</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {groupedCourse.instances.map((course) => (
                                      <TableRow
                                        key={course.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={(e) => handleNavigateToDetail(course.id, e)}
                                      >
                                        <TableCell>
                                          {course.teaching_dept_detail.id === currentDepartment?.id ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400">
                                              Self-Taught
                                            </Badge>
                                          ) : (
                                            <div className="flex items-center gap-1">
                                              <School className="h-3.5 w-3.5 text-orange-500" />
                                              <span>{course.teaching_dept_detail.dept_name}</span>
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {course.for_dept_detail.id === currentDepartment?.id ? (
                                            <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400">
                                              Our Students
                                            </Badge>
                                          ) : (
                                            <div className="flex items-center gap-1">
                                              <GraduationCap className="h-3.5 w-3.5 text-purple-500" />
                                              <span>{course.for_dept_detail.dept_name}</span>
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell>Year {course.course_year}, Sem {course.course_semester}</TableCell>
                                        <TableCell>
                                          <CompactRelationshipTag
                                            ownerDept={course.course_detail.course_dept_detail.dept_name}
                                            teacherDept={course.teaching_dept_detail.dept_name}
                                            forDept={course.for_dept_detail.dept_name}
                                            currentDeptId={currentDepartment?.id || 0}
                                            ownerDeptId={course.course_detail.course_dept_detail.id}
                                            teacherDeptId={course.teaching_dept_detail.id}
                                            forDeptId={course.for_dept_detail.id}
                                          />
                                        </TableCell>
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
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => handleNavigateToDetail(course.id, e)}
                                          >
                                            View
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
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
                      <span>Courses We Teach</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 rounded-full">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p>Courses your department is responsible for teaching, including courses you own and courses from other departments. This view groups courses by course master and shows who they're taught for.</p>
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
                    {isPending ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p>Loading course data...</p>
                      </div>
                    ) : groupedTeachingCourses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery ? (
                          <>No courses match your search. <Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button></>
                        ) : (
                          "Your department isn't currently teaching any courses (either your own or others')."
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 p-4">
                        {groupedTeachingCourses.map((groupedCourse) => (
                          <Card key={groupedCourse.courseDetail.id} className="overflow-hidden border-orange-100 dark:border-orange-900/40 shadow-sm">
                            <CardHeader className="bg-orange-50/50 dark:bg-orange-950/30 px-6 py-3">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <School className="h-5 w-5 text-orange-500" />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-base">
                                          {groupedCourse.courseDetail.course_id}: {groupedCourse.courseDetail.course_name}
                                        </h3>
                                        <Badge variant="outline" className="bg-blue-50/80 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                                          <div className="flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            <span>Owned by {groupedCourse.courseDetail.course_dept_detail.dept_name}</span>
                                          </div>
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {groupedCourse.courseDetail.credits} credits • {
                                          groupedCourse.courseDetail.course_type === 'T' ? 'Theory' :
                                            groupedCourse.courseDetail.course_type === 'L' ? 'Lab' :
                                              'Lab & Theory'
                                        } • Regulation: {groupedCourse.courseDetail.regulation}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="bg-orange-100/50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800">
                                    {groupedCourse.instances.length} instances
                                  </Badge>
                                </div>

                                {groupedCourse.instances.length > 0 && (
                                  <RelationshipTag
                                    ownerDept={groupedCourse.courseDetail.course_dept_detail.dept_name}
                                    teacherDept={groupedCourse.instances[0].teaching_dept_detail.dept_name}
                                    forDept={groupedCourse.instances[0].for_dept_detail.dept_name}
                                    currentDeptId={currentDepartment?.id || 0}
                                    ownerDeptId={groupedCourse.courseDetail.course_dept_detail.id}
                                    teacherDeptId={groupedCourse.instances[0].teaching_dept_detail.id}
                                    forDeptId={groupedCourse.instances[0].for_dept_detail.id}
                                  />
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="px-0 py-0">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>For Students Of</TableHead>
                                    <TableHead>Year & Semester</TableHead>
                                    <TableHead>Relationship</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {groupedCourse.instances.map((course) => (
                                    <TableRow
                                      key={course.id}
                                      className="cursor-pointer hover:bg-muted/50"
                                      onClick={(e) => handleNavigateToDetail(course.id, e)}
                                    >
                                      <TableCell>
                                        {course.for_dept_detail.id === currentDepartment?.id ? (
                                          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400">
                                            Our Students
                                          </Badge>
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            <GraduationCap className="h-3.5 w-3.5 text-purple-500" />
                                            <span>{course.for_dept_detail.dept_name}</span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>Year {course.course_year}, Sem {course.course_semester}</TableCell>
                                      <TableCell>
                                        <CompactRelationshipTag
                                          ownerDept={course.course_detail.course_dept_detail.dept_name}
                                          teacherDept={course.teaching_dept_detail.dept_name}
                                          forDept={course.for_dept_detail.dept_name}
                                          currentDeptId={currentDepartment?.id || 0}
                                          ownerDeptId={course.course_detail.course_dept_detail.id}
                                          teacherDeptId={course.teaching_dept_detail.id}
                                          forDeptId={course.for_dept_detail.id}
                                        />
                                      </TableCell>
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
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => handleNavigateToDetail(course.id, e)}
                                        >
                                          View
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
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
                      <span>Others Teach Our Courses</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 rounded-full">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p>Your department is the <strong>Course Owner</strong> but another department is the <strong>Teaching Department</strong>. You maintain the curriculum while they provide faculty. This view groups courses by course master and shows which departments teach your courses.</p>
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
                    {isPending ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p>Loading course data...</p>
                      </div>
                    ) : groupedReceivingCourses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery ? (
                          <>No courses match your search. <Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button></>
                        ) : (
                          "No courses owned by your department are being taught by other departments."
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 p-4">
                        {groupedReceivingCourses.map((groupedCourse) => (
                          <Card key={groupedCourse.courseDetail.id} className="overflow-hidden border-green-100 dark:border-green-900/40 shadow-sm">
                            <CardHeader className="bg-green-50/50 dark:bg-green-950/30 px-6 py-3">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                    <div>
                                      <h3 className="font-medium text-base">
                                        {groupedCourse.courseDetail.course_id}: {groupedCourse.courseDetail.course_name}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        {groupedCourse.courseDetail.credits} credits • {
                                          groupedCourse.courseDetail.course_type === 'T' ? 'Theory' :
                                            groupedCourse.courseDetail.course_type === 'L' ? 'Lab' :
                                              'Lab & Theory'
                                        } • Regulation: {groupedCourse.courseDetail.regulation}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                                    {groupedCourse.instances.length} instances
                                  </Badge>
                                </div>

                                {groupedCourse.instances.length > 0 && (
                                  <RelationshipTag
                                    ownerDept={groupedCourse.courseDetail.course_dept_detail.dept_name}
                                    teacherDept={groupedCourse.instances[0].teaching_dept_detail.dept_name}
                                    forDept={groupedCourse.instances[0].for_dept_detail.dept_name}
                                    currentDeptId={currentDepartment?.id || 0}
                                    ownerDeptId={groupedCourse.courseDetail.course_dept_detail.id}
                                    teacherDeptId={groupedCourse.instances[0].teaching_dept_detail.id}
                                    forDeptId={groupedCourse.instances[0].for_dept_detail.id}
                                  />
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="px-0 py-0">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Teaching Department</TableHead>
                                    <TableHead>For Students Of</TableHead>
                                    <TableHead>Year & Semester</TableHead>
                                    <TableHead>Relationship</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {groupedCourse.instances.map((course) => (
                                    <TableRow
                                      key={course.id}
                                      className="cursor-pointer hover:bg-muted/50"
                                      onClick={(e) => handleNavigateToDetail(course.id, e)}
                                    >
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <School className="h-3.5 w-3.5 text-orange-500" />
                                          <span>{course.teaching_dept_detail.dept_name}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {course.for_dept_detail.id === currentDepartment?.id ? (
                                          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400">
                                            Our Students
                                          </Badge>
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            <GraduationCap className="h-3.5 w-3.5 text-purple-500" />
                                            <span>{course.for_dept_detail.dept_name}</span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>Year {course.course_year}, Sem {course.course_semester}</TableCell>
                                      <TableCell>
                                        <CompactRelationshipTag
                                          ownerDept={course.course_detail.course_dept_detail.dept_name}
                                          teacherDept={course.teaching_dept_detail.dept_name}
                                          forDept={course.for_dept_detail.dept_name}
                                          currentDeptId={currentDepartment?.id || 0}
                                          ownerDeptId={course.course_detail.course_dept_detail.id}
                                          teacherDeptId={course.teaching_dept_detail.id}
                                          forDeptId={course.for_dept_detail.id}
                                        />
                                      </TableCell>
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
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => handleNavigateToDetail(course.id, e)}
                                        >
                                          View
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
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
                      <span>Courses For Our Students</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 p-0 rounded-full">
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p>Your department is the <strong>For Students</strong> department. These courses are created and taught by other departments, but your students take them as part of their curriculum. This view groups courses by course master and shows which departments teach these courses.</p>
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
                    {isPending ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p>Loading course data...</p>
                      </div>
                    ) : groupedForDeptCourses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery ? (
                          <>No courses match your search. <Button variant="link" className="p-0 h-auto" onClick={handleClearSearch}>Clear filter</Button></>
                        ) : (
                          "No external courses are being taught to your department's students."
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 p-4">
                        {groupedForDeptCourses.map((groupedCourse) => (
                          <Card key={groupedCourse.courseDetail.id} className="overflow-hidden border-purple-100 dark:border-purple-900/40 shadow-sm">
                            <CardHeader className="bg-purple-50/50 dark:bg-purple-950/30 px-6 py-3">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <GraduationCap className="h-5 w-5 text-purple-500" />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-base">
                                          {groupedCourse.courseDetail.course_id}: {groupedCourse.courseDetail.course_name}
                                        </h3>
                                        <Badge variant="outline" className="bg-blue-50/80 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                                          <div className="flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            <span>Owned by {groupedCourse.courseDetail.course_dept_detail.dept_name}</span>
                                          </div>
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {groupedCourse.courseDetail.credits} credits • {
                                          groupedCourse.courseDetail.course_type === 'T' ? 'Theory' :
                                            groupedCourse.courseDetail.course_type === 'L' ? 'Lab' :
                                              'Lab & Theory'
                                        } • Regulation: {groupedCourse.courseDetail.regulation}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="bg-purple-100/50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                                    {groupedCourse.instances.length} instances
                                  </Badge>
                                </div>

                                {groupedCourse.instances.length > 0 && (
                                  <RelationshipTag
                                    ownerDept={groupedCourse.courseDetail.course_dept_detail.dept_name}
                                    teacherDept={groupedCourse.instances[0].teaching_dept_detail.dept_name}
                                    forDept={groupedCourse.instances[0].for_dept_detail.dept_name}
                                    currentDeptId={currentDepartment?.id || 0}
                                    ownerDeptId={groupedCourse.courseDetail.course_dept_detail.id}
                                    teacherDeptId={groupedCourse.instances[0].teaching_dept_detail.id}
                                    forDeptId={groupedCourse.instances[0].for_dept_detail.id}
                                  />
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="px-0 py-0">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Teaching Department</TableHead>
                                    <TableHead>Year & Semester</TableHead>
                                    <TableHead>Relationship</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {groupedCourse.instances.map((course) => (
                                    <TableRow
                                      key={course.id}
                                      className="cursor-pointer hover:bg-muted/50"
                                      onClick={(e) => handleNavigateToDetail(course.id, e)}
                                    >
                                      <TableCell>
                                        {course.teaching_dept_detail.id === currentDepartment?.id ? (
                                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400">
                                            We Teach
                                          </Badge>
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            <School className="h-3.5 w-3.5 text-orange-500" />
                                            <span>{course.teaching_dept_detail.dept_name}</span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>Year {course.course_year}, Sem {course.course_semester}</TableCell>
                                      <TableCell>
                                        <CompactRelationshipTag
                                          ownerDept={course.course_detail.course_dept_detail.dept_name}
                                          teacherDept={course.teaching_dept_detail.dept_name}
                                          forDept={course.for_dept_detail.dept_name}
                                          currentDeptId={currentDepartment?.id || 0}
                                          ownerDeptId={course.course_detail.course_dept_detail.id}
                                          teacherDeptId={course.teaching_dept_detail.id}
                                          forDeptId={course.for_dept_detail.id}
                                        />
                                      </TableCell>
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
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => handleNavigateToDetail(course.id, e)}
                                        >
                                          View
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

    </div>
  );
} 