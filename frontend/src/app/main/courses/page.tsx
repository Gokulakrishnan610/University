import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useGetCourses, useDeleteCourse, Course } from '@/action/course';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Pencil, Eye, BookOpen, Trash2, Search, X, Filter, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import CourseForm from './form';

export default function CourseManagement() {
  const navigate = useNavigate();
  const { data: coursesData, isPending: isLoading, refetch } = useGetCourses();
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string[]>([]);
  const [selectedYearFilter, setSelectedYearFilter] = useState<string[]>([]);
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string[]>([]);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string[]>([]);

  const courses = coursesData || [];
  const { mutate: deleteCourse } = useDeleteCourse(courseToDelete?.id || 0, () => {
    refetch();
    setCourseToDelete(null);
    toast.success('Course deleted successfully');
  });

  // Extract unique values for filters
  const uniqueTypes = useMemo<string[]>(() => {
    return Array.from(new Set(courses.map((c: Course) => c.course_type)));
  }, [courses]);

  const uniqueYears = useMemo<string[]>(() => {
    return Array.from(new Set(courses.map((c: Course) => c.course_year.toString())));
  }, [courses]);

  const uniqueSemesters = useMemo<string[]>(() => {
    return Array.from(new Set(courses.map((c: Course) => c.course_semester.toString())));
  }, [courses]);

  const uniqueDepartments = useMemo<string[]>(() => {
    return Array.from(new Set(courses.map((c: Course) => c.department_name || 'N/A').filter(Boolean)));
  }, [courses]);

  // Filter courses based on search query and filters
  const filteredCourses = useMemo(() => {
    return courses.filter((course: Course) => {
      // Apply search query
      const courseName = course.course_name.toLowerCase();
      const courseCode = course.course_code.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = searchQuery === '' || 
          courseName.includes(searchLower) || 
          courseCode.includes(searchLower);
      
      // Apply filters
      const matchesType = selectedTypeFilter.length === 0 || 
          selectedTypeFilter.includes(course.course_type);
      
      const matchesYear = selectedYearFilter.length === 0 || 
          selectedYearFilter.includes(course.course_year.toString());
      
      const matchesSemester = selectedSemesterFilter.length === 0 || 
          selectedSemesterFilter.includes(course.course_semester.toString());
      
      const departmentName = course.department_name || 'N/A';
      const matchesDepartment = selectedDepartmentFilter.length === 0 || 
          selectedDepartmentFilter.includes(departmentName);
      
      return matchesSearch && matchesType && matchesYear && matchesSemester && matchesDepartment;
    });
  }, [courses, searchQuery, selectedTypeFilter, selectedYearFilter, selectedSemesterFilter, selectedDepartmentFilter]);

  const handleDelete = () => {
    if (!courseToDelete) return;
    deleteCourse(undefined, {
      onSuccess: () => {
        toast.success('Course deleted successfully');
        refetch();
        setCourseToDelete(null);
      },
      onError: (error) => {
        toast.error('Failed to delete course', {
          description: error.message
        });
        setCourseToDelete(null);
      }
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypeFilter([]);
    setSelectedYearFilter([]);
    setSelectedSemesterFilter([]);
    setSelectedDepartmentFilter([]);
  };

  // Function to export courses as CSV
  const exportToCSV = () => {
    const headers = ['Course Code', 'Course Name', 'Department', 'Type', 'Year', 'Semester', 'Credits'];
    
    const csvRows = [
      headers.join(','),
      ...filteredCourses.map((c: Course) => [
        `"${c.course_code}"`,
        `"${c.course_name}"`,
        `"${c.department_name || 'N/A'}"`,
        `"${c.course_type}"`,
        c.course_year,
        c.course_semester,
        c.credits
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `courses-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full mx-auto">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Course Management</CardTitle>
            </div>
            <CardDescription className="mt-1.5">
              Manage courses in your department
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} disabled={filteredCourses.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/20">
              <BookOpen className="h-16 w-16 text-muted-foreground/60 mb-4" />
              <p className="text-muted-foreground text-lg mb-4">
                No courses found in your department
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Course
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search courses..."
                    className="pl-8 w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        Type
                        {selectedTypeFilter.length > 0 && (
                          <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                            {selectedTypeFilter.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {uniqueTypes.map((type) => (
                        <DropdownMenuItem key={type} className="flex items-center gap-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedTypeFilter.includes(type)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedTypeFilter(prev => [...prev, type]);
                              } else {
                                setSelectedTypeFilter(prev => prev.filter(t => t !== type));
                              }
                            }}
                          />
                          <label htmlFor={`type-${type}`} className="flex-1 cursor-pointer">
                            {type}
                          </label>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        Year
                        {selectedYearFilter.length > 0 && (
                          <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                            {selectedYearFilter.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {uniqueYears.map((year) => (
                        <DropdownMenuItem key={year} className="flex items-center gap-2">
                          <Checkbox
                            id={`year-${year}`}
                            checked={selectedYearFilter.includes(year)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedYearFilter(prev => [...prev, year]);
                              } else {
                                setSelectedYearFilter(prev => prev.filter(y => y !== year));
                              }
                            }}
                          />
                          <label htmlFor={`year-${year}`} className="flex-1 cursor-pointer">
                            Year {year}
                          </label>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        Semester
                        {selectedSemesterFilter.length > 0 && (
                          <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                            {selectedSemesterFilter.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {uniqueSemesters.map((semester) => (
                        <DropdownMenuItem key={semester} className="flex items-center gap-2">
                          <Checkbox
                            id={`semester-${semester}`}
                            checked={selectedSemesterFilter.includes(semester)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedSemesterFilter(prev => [...prev, semester]);
                              } else {
                                setSelectedSemesterFilter(prev => prev.filter(s => s !== semester));
                              }
                            }}
                          />
                          <label htmlFor={`semester-${semester}`} className="flex-1 cursor-pointer">
                            Semester {semester}
                          </label>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        Department
                        {selectedDepartmentFilter.length > 0 && (
                          <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                            {selectedDepartmentFilter.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {uniqueDepartments.map((dept) => (
                        <DropdownMenuItem key={dept} className="flex items-center gap-2">
                          <Checkbox
                            id={`dept-${dept}`}
                            checked={selectedDepartmentFilter.includes(dept)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedDepartmentFilter(prev => [...prev, dept]);
                              } else {
                                setSelectedDepartmentFilter(prev => prev.filter(d => d !== dept));
                              }
                            }}
                          />
                          <label htmlFor={`dept-${dept}`} className="flex-1 cursor-pointer">
                            {dept}
                          </label>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {(searchQuery || selectedTypeFilter.length > 0 || selectedYearFilter.length > 0 || 
                    selectedSemesterFilter.length > 0 || selectedDepartmentFilter.length > 0) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9"
                      onClick={clearFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course: Course) => (
                      <TableRow
                        key={course.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/courses/${course.id}`)}>
                        <TableCell className="font-medium">{course.course_code}</TableCell>
                        <TableCell>{course.course_name}</TableCell>
                        <TableCell>{course.department_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                            {course.course_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{course.course_year}</TableCell>
                        <TableCell>{course.course_semester}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[240px]">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/courses/${course.id}`);
                              }}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/courses/${course.id}?edit=true`);
                              }}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit Course
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCourseToDelete(course);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Showing {filteredCourses.length} of {courses.length} courses
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showCreateForm && (
        <CourseForm
          mode="create"
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            refetch();
          }}
        />
      )}

      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{courseToDelete?.course_name}</span>?
              <br /><br />
              This action cannot be undone. All associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 