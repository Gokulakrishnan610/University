import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useGetCourseMasters, CourseMaster } from '@/action/courseMaster';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourseMastersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [courseTypeFilter, setCourseTypeFilter] = useState<string>('');
  const pageSize = 10;

  const { data: courseMastersData, isPending: loadingCourseMasters } = useGetCourseMasters(
    page,
    pageSize,
    searchTerm
  );
  
  const { data: departmentsData, isPending: loadingDepartments } = useGetDepartments();
  
  const departments = departmentsData || [];
  const courseMasters = courseMastersData?.results || [];
  const totalCount = courseMastersData?.count || 0;
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Effect to reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, departmentFilter, courseTypeFilter]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Course Masters Catalog</h1>
        <Button onClick={() => navigate('/courses/create')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create New
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            Browse all course masters in the university catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course code or name..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 md:w-2/5">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
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
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="T">Theory</SelectItem>
                  <SelectItem value="L">Lab</SelectItem>
                  <SelectItem value="LoT">Lab & Theory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseMasters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No course masters found
                        </TableCell>
                      </TableRow>
                    ) : (
                      courseMasters.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.course_id}</TableCell>
                          <TableCell>{course.course_name}</TableCell>
                          <TableCell>{course.course_dept_detail?.dept_name}</TableCell>
                          <TableCell className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {course.credits}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              {getCourseTypeLabel(course.course_type)}
                            </Badge>
                            {course.is_zero_credit_course && (
                              <Badge variant="outline" className="ml-2 bg-red-500/10 text-red-500">
                                Zero Credit
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(course.id)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
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
        </CardContent>
      </Card>
    </div>
  );
} 