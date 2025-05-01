import { useState, useMemo } from 'react';
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
  CircleDot
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

export default function AllCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(false);
  
  const navigate = useNavigate();
  
  const { data: departmentData, isPending } = useGetCurrentDepartmentCourses();
  
  // Combine all courses from different roles
  const allOwnedCourses = departmentData?.owned_courses?.data || [];
  const allTeachingCourses = departmentData?.teaching_courses?.data || [];
  const allReceivingCourses = departmentData?.receiving_courses?.data || [];
  const allForDeptCourses = departmentData?.for_dept_courses?.data || [];
  
  // Add role information to each course
  const coursesWithRoles = useMemo(() => {
    const owned = allOwnedCourses.map(course => ({ 
      ...course, 
      userRole: 'owner',
      roleDescription: 'We Own' 
    }));
    
    const teaching = allTeachingCourses.map(course => ({ 
      ...course, 
      userRole: 'teacher',
      roleDescription: 'We Teach for Others' 
    }));
    
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
    let filtered = coursesWithRoles;
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(course => course.userRole === roleFilter);
    }
    
    // Apply year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(course => course.course_year.toString() === yearFilter);
    }
    
    // Apply semester filter
    if (semesterFilter !== 'all') {
      filtered = filtered.filter(course => course.course_semester.toString() === semesterFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.teaching_status === statusFilter);
    }
    
    // Apply relationship filter
    if (relationshipFilter !== 'all') {
      filtered = filtered.filter(course => course.relationship_type?.code === relationshipFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(course => 
        course.course_detail.course_id.toLowerCase().includes(query) ||
        course.course_detail.course_name.toLowerCase().includes(query) ||
        course.teaching_dept_detail.dept_name.toLowerCase().includes(query) ||
        course.for_dept_detail.dept_name.toLowerCase().includes(query) ||
        course.course_detail.course_dept_detail.dept_name.toLowerCase().includes(query) ||
        `year ${course.course_year}`.includes(query) ||
        `sem ${course.course_semester}`.includes(query) ||
        course.teaching_status.toLowerCase().includes(query) ||
        (course.roleDescription && course.roleDescription.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [coursesWithRoles, searchQuery, roleFilter, yearFilter, semesterFilter, statusFilter, relationshipFilter]);
  
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
        return 'Your department created this course and controls its curriculum.';
      case 'teacher':
        return 'Your department teaches this course for students from other departments.';
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
              <CardTitle className="text-2xl">Departmental Course Relationships</CardTitle>
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
                                <span>We Teach for Others</span>
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
                  <p>As <strong>Course Owner</strong>, your department creates the course, defines its content and curriculum, and maintains academic standards.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900/30 cursor-help">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <School className="h-5 w-5 text-orange-500" />
                        <h3 className="font-medium">We Teach for Others</h3>
                      </div>
                      <Badge variant="outline" className="bg-background">{allTeachingCourses.length}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Courses we teach but don't own</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>As <strong>Teaching Department</strong>, your faculty are responsible for delivering courses that are owned by other departments.</p>
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
                  {filteredCourses.map((course) => (
                    <TableRow 
                      key={`${course.id}-${course.userRole}`} 
                      className="cursor-pointer hover:bg-muted/50" 
                      onClick={(e) => handleNavigateToDetail(course.id, e)}
                    >
                      <TableCell className="font-medium">{course.course_detail.course_id}</TableCell>
                      <TableCell>{course.course_detail.course_name}</TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`flex items-center gap-1.5 py-0.5 px-1.5 rounded ${getRoleClass(course.userRole)}`}>
                                {getRoleIcon(course.userRole)}
                                <span>{course.roleDescription}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p>{getRoleFullDescription(course.userRole)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
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
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5 text-purple-500" />
                          <span>{course.for_dept_detail.dept_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getRelationshipBadgeColor(course.relationship_type?.code || 'UNKNOWN')}
                        >
                          {getRelationshipShortName(course.relationship_type?.code || 'UNKNOWN', course.userRole)}
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
            </div>
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {coursesWithRoles.length} courses
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 