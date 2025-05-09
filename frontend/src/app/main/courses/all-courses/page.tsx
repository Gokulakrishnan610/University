import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
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
  BookOpen,
  Search,
  ArrowUpDown,
  School,
  Users,
  ChevronLeft,
  Filter,
  Loader2,
  GraduationCap,
  CalendarIcon,
  SlidersHorizontal,
  InfoIcon,
  HelpCircle,
  ArrowLeftRight,
  Building,
  CircleDot,
  Info,
  Share2,
  Group,
  AlignJustify,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { useGetCurrentDepartmentCourses, Course } from '@/action/course';
import { getRelationshipBadgeColor, getRelationshipShortName } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetCurrentDepartment } from '@/action/department';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

// Interface for a course with multiple roles
interface UniqueCourse {
  id: number;
  course: Course;
  courseId: string;
  roles: {
    role: string;
    roleDescription: string;
  }[];
  relationshipTypes: string[];
}

// Component for displaying relationship tag similar to main courses page
interface RelationshipTagProps {
  course: Course;
  currentDeptId: number;
}

const RelationshipTag = ({ course, currentDeptId }: RelationshipTagProps) => {
  const ownerDeptId = course.course_detail.course_dept_detail.id;
  const teacherDeptId = course.teaching_dept_id;
  const forDeptId = course.for_dept_id;
  const ownerDept = course.course_detail.course_dept_detail.dept_name;
  const teacherDept = course.teaching_dept_detail.dept_name;
  const forDept = course.for_dept_detail.dept_name;

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

export default function AllCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  const [groupBy, setGroupBy] = useState<'none' | 'code' | 'name'>('none');

  const navigate = useNavigate();

  // Add scroll restoration
  useScrollRestoration('all-courses-page');

  const { data: departmentData, isPending } = useGetCurrentDepartmentCourses();
  const { data: currentDepartment } = useGetCurrentDepartment();

  // Combine all courses from different roles
  const allOwnedCourses = departmentData?.owned_courses?.data || [];
  const allTeachingCourses = departmentData?.teaching_courses?.data || [];
  const allReceivingCourses = departmentData?.receiving_courses?.data || [];
  const allForDeptCourses = departmentData?.for_dept_courses?.data || [];

  // Add role information to each course
  const coursesWithRoles = useMemo(() => {
    const owned = allOwnedCourses.map(course => {
      // Check if this is a self-taught course (we own and teach it)
      const isSelfTaught = course.course_detail.course_dept_detail.id === course.teaching_dept_id;
      return {
        ...course,
        userRole: 'owner',
        roleDescription: isSelfTaught ? 'We Own & Teach' : 'We Own'
      };
    });

    const teaching = allTeachingCourses.map(course => {
      // Check if this is a self-taught course (we own it too)
      const isSelfTaught = course.course_detail.course_dept_detail.id === course.teaching_dept_id;
      return {
        ...course,
        userRole: 'teacher',
        roleDescription: isSelfTaught ? 'We Teach (Own)' : 'We Teach'
      };
    });

    const receiving = allReceivingCourses.map(course => ({
      ...course,
      userRole: 'owner_not_teacher',
      roleDescription: 'Others Teach Ours'
    }));

    const forDept = allForDeptCourses.map(course => ({
      ...course,
      userRole: 'learner',
      roleDescription: 'For Our Students'
    }));

    return [...owned, ...teaching, ...receiving, ...forDept];
  }, [allOwnedCourses, allTeachingCourses, allReceivingCourses, allForDeptCourses]);

  // Process and group courses to eliminate redundancy
  const uniqueCourses = useMemo(() => {
    const courseMap = new Map<number, UniqueCourse>();

    // Process all courses with roles and group them by ID
    coursesWithRoles.forEach(course => {
      const courseId = course.id;

      if (!courseMap.has(courseId)) {
        // Initialize a new unique course
        courseMap.set(courseId, {
          id: courseId,
          course: course,
          courseId: course.course_detail.course_id,
          roles: [{
            role: course.userRole,
            roleDescription: course.roleDescription
          }],
          relationshipTypes: [course.relationship_type?.code || 'UNKNOWN']
        });
      } else {
        // Add to existing course entry
        const existingCourse = courseMap.get(courseId)!;

        // Add the role if not already present
        if (!existingCourse.roles.some(r => r.role === course.userRole)) {
          existingCourse.roles.push({
            role: course.userRole,
            roleDescription: course.roleDescription
          });
        }

        // Add the relationship type if not already present
        const relType = course.relationship_type?.code || 'UNKNOWN';
        if (!existingCourse.relationshipTypes.includes(relType)) {
          existingCourse.relationshipTypes.push(relType);
        }
      }
    });

    return Array.from(courseMap.values());
  }, [coursesWithRoles]);

  // Count courses that are both owned and taught by the department
  const selfOwnedSelfTaughtCount = useMemo(() => {
    return allOwnedCourses.filter(course =>
      course.course_detail.course_dept_detail.id === course.teaching_dept_id
    ).length;
  }, [allOwnedCourses]);

  // Get unique years, semesters and relationship types for filters
  const uniqueYears = useMemo(() => {
    const years = new Set(coursesWithRoles.map(course => course.course_year.toString()));
    return Array.from(years).sort();
  }, [coursesWithRoles]);

  const uniqueSemesters = useMemo(() => {
    const semesters = new Set(coursesWithRoles.map(course => course.course_semester.toString()));
    return Array.from(semesters).sort();
  }, [coursesWithRoles]);

  const uniqueRelationships = useMemo(() => {
    const relationships = new Set(coursesWithRoles.map(course => course.relationship_type?.code || 'UNKNOWN'));
    return Array.from(relationships);
  }, [coursesWithRoles]);

  // Filter courses based on search query and all filters
  const filteredCourses = useMemo(() => {
    let filtered = uniqueCourses;

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(uniqueCourse =>
        uniqueCourse.roles.some(r => r.role === roleFilter)
      );
    }

    // Apply year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(uniqueCourse =>
        uniqueCourse.course.course_year.toString() === yearFilter
      );
    }

    // Apply semester filter
    if (semesterFilter !== 'all') {
      filtered = filtered.filter(uniqueCourse =>
        uniqueCourse.course.course_semester.toString() === semesterFilter
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(uniqueCourse =>
        uniqueCourse.course.teaching_status === statusFilter
      );
    }

    // Apply relationship filter
    if (relationshipFilter !== 'all') {
      filtered = filtered.filter(uniqueCourse =>
        uniqueCourse.relationshipTypes.includes(relationshipFilter)
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(uniqueCourse => {
        const course = uniqueCourse.course;
        return (
          course.course_detail.course_id.toLowerCase().includes(query) ||
          course.course_detail.course_name.toLowerCase().includes(query) ||
          course.teaching_dept_detail.dept_name.toLowerCase().includes(query) ||
          course.for_dept_detail.dept_name.toLowerCase().includes(query) ||
          course.course_detail.course_dept_detail.dept_name.toLowerCase().includes(query) ||
          `year ${course.course_year}`.includes(query) ||
          `sem ${course.course_semester}`.includes(query) ||
          course.teaching_status.toLowerCase().includes(query) ||
          uniqueCourse.roles.some(r => r.roleDescription.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [uniqueCourses, searchQuery, roleFilter, yearFilter, semesterFilter, statusFilter, relationshipFilter]);

  // Helper function to get course prefix (e.g., "CS" from "CS101")
  const getCoursePrefix = (courseId: string): string => {
    const match = courseId.match(/^([A-Za-z]+)/);
    return match ? match[0] : 'Other';
  };

  // Helper function to get the first letter of course name
  const getCourseFirstLetter = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  // Group courses based on the selected grouping option
  const groupedCourses = useMemo(() => {
    if (groupBy === 'none') {
      return { ungrouped: filteredCourses };
    }

    const groups: Record<string, UniqueCourse[]> = {};

    filteredCourses.forEach(course => {
      let groupKey = '';

      if (groupBy === 'code') {
        // Use the full course code instead of just the prefix
        groupKey = course.course.course_detail.course_id;
      } else if (groupBy === 'name') {
        // Use the full course name instead of just the first letter
        groupKey = course.course.course_detail.course_name;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(course);
    });

    // Sort the keys
    return Object.fromEntries(
      Object.entries(groups).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    );
  }, [filteredCourses, groupBy]);

  const handleNavigateToDetail = (courseId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    navigate(`/courses/${courseId}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setYearFilter('all');
    setSemesterFilter('all');
    setStatusFilter('all');
    setRelationshipFilter('all');
  };

  const isAnyFilterActive = () => {
    return searchQuery.trim() !== '' ||
      roleFilter !== 'all' ||
      yearFilter !== 'all' ||
      semesterFilter !== 'all' ||
      statusFilter !== 'all' ||
      relationshipFilter !== 'all';
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (roleFilter !== 'all') count++;
    if (yearFilter !== 'all') count++;
    if (semesterFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (relationshipFilter !== 'all') count++;
    return count;
  }, [roleFilter, yearFilter, semesterFilter, statusFilter, relationshipFilter]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'teacher':
        return <School className="h-4 w-4 text-orange-500" />;
      case 'owner_not_teacher':
        return <ArrowLeftRight className="h-4 w-4 text-green-500" />;
      case 'learner':
        return <GraduationCap className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case 'owner':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
      case 'teacher':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950/30';
      case 'owner_not_teacher':
        return 'text-green-600 bg-green-50 dark:bg-green-950/30';
      case 'learner':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950/30';
      default:
        return '';
    }
  };

  const getRoleFullDescription = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Your department created this course and controls its curriculum. This includes courses you also teach yourself.';
      case 'teacher':
        return 'Your department provides faculty to teach this course. This includes both courses you own and courses from other departments.';
      case 'owner_not_teacher':
        return 'Your department created this course, but another department teaches it.';
      case 'learner':
        return 'Your department\'s students take this course taught and owned by another department.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Departmental Courses</CardTitle>
              <CardDescription className="mt-1">
                View all courses where your department has a role as Course Owner, Teaching Department, or For Students
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7"
                    onClick={handleClearSearch}
                  >
                    <span className="sr-only">Clear search</span>
                    ×
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Select
                          value={roleFilter}
                          onValueChange={(value) => setRoleFilter(value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by department role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Department Roles</SelectItem>
                            <SelectItem value="owner" className="flex items-center">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                <span>We Own</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="teacher">
                              <div className="flex items-center gap-2">
                                <School className="h-4 w-4 text-orange-500" />
                                <span>We Teach</span>
                                <span className="text-xs text-muted-foreground">(includes own & others)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="owner_not_teacher">
                              <div className="flex items-center gap-2">
                                <ArrowLeftRight className="h-4 w-4 text-green-500" />
                                <span>Others Teach Ours</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="learner">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-purple-500" />
                                <span>For Our Students</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Filter courses by your department's role in each course.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Select
                          value={groupBy}
                          onValueChange={(value: 'none' | 'code' | 'name') => setGroupBy(value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Group by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <div className="flex items-center gap-2">
                                <AlignJustify className="h-4 w-4" />
                                <span>No Grouping</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="code">
                              <div className="flex items-center gap-2">
                                <ListFilter className="h-4 w-4" />
                                <span>Group by Course Code</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="name">
                              <div className="flex items-center gap-2">
                                <Group className="h-4 w-4" />
                                <span>Group by Course Name</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Group courses by identical course codes or names.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Popover open={showFilterMenu} onOpenChange={setShowFilterMenu}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-1.5"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>Filters</span>
                      {activeFiltersCount > 0 && (
                        <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-4" align="end">
                    <div className="space-y-4">
                      <h4 className="font-medium">Additional Filters</h4>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Year</label>
                        <Select
                          value={yearFilter}
                          onValueChange={(value) => setYearFilter(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Years" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {uniqueYears.map(year => (
                              <SelectItem key={year} value={year}>Year {year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Semester</label>
                        <Select
                          value={semesterFilter}
                          onValueChange={(value) => setSemesterFilter(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Semesters" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            {uniqueSemesters.map(semester => (
                              <SelectItem key={semester} value={semester}>Semester {semester}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={statusFilter}
                          onValueChange={(value) => setStatusFilter(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Relationship Type</label>
                        <Select
                          value={relationshipFilter}
                          onValueChange={(value) => setRelationshipFilter(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="All Relationships" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Relationships</SelectItem>
                            {uniqueRelationships.map(type => (
                              <SelectItem key={type} value={type}>
                                {getRelationshipShortName(type, 'any')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          handleClearFilters();
                          setShowFilterMenu(false);
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {isAnyFilterActive() && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearFilters}
                    title="Clear filters"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Role Summary Cards */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/30 cursor-help">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium">We Own</h3>
                      </div>
                      <Badge variant="outline" className="bg-background">{allOwnedCourses.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Courses created and maintained by our department</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>As <strong>Course Owner</strong>, your department creates the course, defines its content and curriculum, and maintains academic standards. This includes courses you teach yourself.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900/30 cursor-help">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <School className="h-5 w-5 text-orange-500" />
                        <h3 className="font-medium">We Teach</h3>
                      </div>
                      <Badge variant="outline" className="bg-background">{allTeachingCourses.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Courses taught by your faculty (includes both your own and others' courses)</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>As <strong>Teaching Department</strong>, your faculty are responsible for teaching courses. This includes both courses you own and courses owned by other departments.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900/30 cursor-help">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5 text-green-500" />
                        <h3 className="font-medium">Others Teach Ours</h3>
                      </div>
                      <Badge variant="outline" className="bg-background">{allReceivingCourses.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Our courses taught by other departments</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>These are courses <strong>owned by your department</strong> but <strong>taught by faculty from other departments</strong>.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-900/30 cursor-help">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-purple-500" />
                        <h3 className="font-medium">For Our Students</h3>
                      </div>
                      <Badge variant="outline" className="bg-background">{allForDeptCourses.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">External courses taken by our students</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>These are courses that your students take, but are both <strong>owned and taught by other departments</strong>.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {isPending ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading courses...</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {isAnyFilterActive() ? (
                <>
                  <p>No courses match your search criteria.</p>
                  <Button variant="link" className="mt-2" onClick={handleClearFilters}>
                    Clear all filters
                  </Button>
                </>
              ) : (
                <p>Your department is not involved in any courses.</p>
              )}
            </div>
          ) : (
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
                    <TableHead>Department Role</TableHead>
                    <TableHead>Owner Department</TableHead>
                    <TableHead>Teaching Department</TableHead>
                    <TableHead>For Department</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Year & Semester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedCourses).map(([groupKey, courses]) => (
                    <React.Fragment key={groupKey}>
                      {groupBy !== 'none' && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={10} className="py-2">
                            <div className="flex items-center gap-2 font-medium">
                              {groupBy === 'code' ? (
                                <>
                                  <Badge variant="outline" className="bg-primary/5 text-primary">
                                    Course Code: <span className="font-bold ml-1">{groupKey}</span>
                                  </Badge>
                                  <span className="text-muted-foreground text-sm">
                                    ({courses.length} {courses.length === 1 ? 'course' : 'courses'})
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Badge variant="outline" className="bg-primary/5 text-primary">
                                    <span className="font-bold truncate max-w-xs">{groupKey}</span>
                                  </Badge>
                                  <span className="text-muted-foreground text-sm">
                                    ({courses.length} {courses.length === 1 ? 'course' : 'courses'})
                                  </span>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {courses.map((uniqueCourse) => (
                        <TableRow
                          key={uniqueCourse.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={(e) => handleNavigateToDetail(uniqueCourse.id, e)}
                        >
                          <TableCell className="font-medium">{uniqueCourse.course.course_detail.course_id}</TableCell>
                          <TableCell>{uniqueCourse.course.course_detail.course_name}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {/* Show primary role - prioritize owner over teacher over others */}
                                  {(() => {
                                    // Sort roles by priority
                                    const sortedRoles = [...uniqueCourse.roles].sort((a, b) => {
                                      const priority = { 'owner': 0, 'teacher': 1, 'owner_not_teacher': 2, 'learner': 3 };
                                      return priority[a.role as keyof typeof priority] - priority[b.role as keyof typeof priority];
                                    });

                                    const primaryRole = sortedRoles[0];
                                    const isSelfTaught = uniqueCourse.course.course_detail.course_dept_detail.id === uniqueCourse.course.teaching_dept_id;

                                    return (
                                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${getRoleClass(primaryRole.role)}`}>
                                        {getRoleIcon(primaryRole.role)}
                                        <span>{primaryRole.roleDescription}</span>
                                        {isSelfTaught && primaryRole.role === 'owner' && (
                                          <Badge variant="outline" className="ml-1 bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400">
                                            <CircleDot className="h-3 w-3 mr-1" />
                                            <span className="text-xs">Self-taught</span>
                                          </Badge>
                                        )}
                                        {uniqueCourse.roles.length > 1 && (
                                          <Badge className="ml-1 bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400">
                                            +{uniqueCourse.roles.length - 1}
                                          </Badge>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <div className="space-y-2">
                                    <p>This course has multiple roles:</p>
                                    <ul className="space-y-1">
                                      {uniqueCourse.roles.map((role, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                          {getRoleIcon(role.role)}
                                          <span>{role.roleDescription}</span>
                                        </li>
                                      ))}
                                    </ul>
                                    {uniqueCourse.course.course_detail.course_dept_detail.id === uniqueCourse.course.teaching_dept_id && (
                                      <p className="text-sm text-green-600 dark:text-green-400">
                                        <strong>Self-taught course:</strong> Your department both owns and teaches this course.
                                      </p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                              <span>{uniqueCourse.course.course_detail.course_dept_detail.dept_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <School className="h-3.5 w-3.5 text-orange-500" />
                              <span>{uniqueCourse.course.teaching_dept_detail.dept_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5 text-purple-500" />
                              <span>{uniqueCourse.course.for_dept_detail.dept_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {currentDepartment?.id && (
                              <RelationshipTag course={uniqueCourse.course} currentDeptId={currentDepartment.id} />
                            )}
                          </TableCell>
                          <TableCell>Year {uniqueCourse.course.course_year}, Sem {uniqueCourse.course.course_semester}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                uniqueCourse.course.teaching_status === 'active' ? 'default' :
                                  uniqueCourse.course.teaching_status === 'inactive' ? 'secondary' :
                                    'outline'
                              }
                              className={
                                uniqueCourse.course.teaching_status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' :
                                  uniqueCourse.course.teaching_status === 'inactive' ? 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20' :
                                    'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20'
                              }
                            >
                              {uniqueCourse.course.teaching_status === 'active' ? 'Active' :
                                uniqueCourse.course.teaching_status === 'inactive' ? 'Inactive' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleNavigateToDetail(uniqueCourse.id, e)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {uniqueCourses.length} unique courses
            {groupBy !== 'none' && ` (Grouped by ${groupBy === 'code' ? 'identical course codes' : 'identical course names'}, ${Object.keys(groupedCourses).length} groups)`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 