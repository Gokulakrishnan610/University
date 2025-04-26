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

export default function AllCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
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
      roleDescription: 'We own this course' 
    }));
    
    const teaching = allTeachingCourses.map(course => ({ 
      ...course, 
      userRole: 'teacher',
      roleDescription: 'We teach for other departments' 
    }));
    
    const receiving = allReceivingCourses.map(course => ({ 
      ...course, 
      userRole: 'owner_not_teacher',
      roleDescription: 'Others teach our course' 
    }));
    
    const forDept = allForDeptCourses.map(course => ({ 
      ...course, 
      userRole: 'learner',
      roleDescription: 'Our students take this course' 
    }));
    
    return [...owned, ...teaching, ...receiving, ...forDept];
  }, [allOwnedCourses, allTeachingCourses, allReceivingCourses, allForDeptCourses]);
  
  // Filter courses based on search query and role filter
  const filteredCourses = useMemo(() => {
    let filtered = coursesWithRoles;
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(course => course.userRole === roleFilter);
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
  }, [coursesWithRoles, searchQuery, roleFilter]);
  
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
  };
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'teacher':
        return <School className="h-4 w-4 text-orange-500" />;
      case 'owner_not_teacher':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'learner':
        return <GraduationCap className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/courses')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Course Management
        </Button>
      </div>
      
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">All Department Courses</CardTitle>
              <CardDescription className="mt-1">
                View all courses where your department is involved
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
                <Select 
                  value={roleFilter} 
                  onValueChange={(value) => setRoleFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="owner_not_teacher">Owner (Others Teach)</SelectItem>
                    <SelectItem value="learner">For Our Students</SelectItem>
                  </SelectContent>
                </Select>
                
                {(searchQuery || roleFilter !== 'all') && (
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
          {isPending ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading courses...</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery || roleFilter !== 'all' ? (
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
                        <div className="flex items-center gap-1.5">
                          {getRoleIcon(course.userRole)}
                          <span>{course.roleDescription}</span>
                        </div>
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
                          <Users className="h-3.5 w-3.5 text-green-500" />
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