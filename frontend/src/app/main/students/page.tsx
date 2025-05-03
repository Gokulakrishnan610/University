import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, Search, Mail, User, ChevronLeft, ChevronRight, Filter, BarChart, GraduationCap, Users, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetStudents, useDeleteStudent, Student, useGetStudentStats } from '@/action/student';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const StudentManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
  const [semesterFilter, setSemesterFilter] = useState<number | undefined>(undefined);
  const [studentTypeFilter, setStudentTypeFilter] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Fetch student statistics
  const { data: stats, isPending: statsLoading } = useGetStudentStats();

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch students data with pagination, search, and filters
  const { data, isPending: isLoading, refetch } = useGetStudents(
    page,
    pageSize,
    debouncedSearchTerm,
    yearFilter,
    semesterFilter,
    studentTypeFilter
  );

  // Reset to first page when search term or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, yearFilter, semesterFilter, studentTypeFilter]);

  const students = data?.results || [];
  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  // Initialize the delete student mutation
  const { mutate: deleteStudent } = useDeleteStudent(0, () => {
    refetch();
  });

  // Handle delete with confirmation
  const handleDelete = (id: number) => {
    deleteStudent(id);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setYearFilter(undefined);
    setSemesterFilter(undefined);
    setStudentTypeFilter(undefined);
  };

  // Handle year filter change
  const handleYearFilterChange = (value: string) => {
    if (value === "all") {
      setYearFilter(undefined);
    } else {
      setYearFilter(parseInt(value));
    }
  };

  // Handle semester filter change
  const handleSemesterFilterChange = (value: string) => {
    if (value === "all") {
      setSemesterFilter(undefined);
    } else {
      setSemesterFilter(parseInt(value));
    }
  };

  // Handle student type filter change
  const handleStudentTypeFilterChange = (value: string) => {
    if (value === "all") {
      setStudentTypeFilter(undefined);
    } else {
      setStudentTypeFilter(value);
    }
  };

  // Check if any filter is active
  const hasActiveFilters = yearFilter !== undefined || semesterFilter !== undefined || studentTypeFilter !== undefined;

  // Get formatted total count
  const getTotalCount = () => {
    if (statsLoading || !stats) return "—";
    return stats.total.toLocaleString();
  };

  return (
    <div className="mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground mt-1">Manage your department's students</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={showStats ? "default" : "outline"}
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="gap-2"
          >
            <BarChart className="h-4 w-4" />
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </Button>
          <Button onClick={() => navigate('/students/create')}>
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {showStats && (
        <div className="mb-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total students card */}
            <Card className="overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Students</p>
                    {statsLoading ? (
                      <Skeleton className="h-10 w-16" />
                    ) : (
                      <div className="text-3xl font-bold">{getTotalCount()}</div>
                    )}
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students by year */}
            <Card className="overflow-hidden border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-medium text-muted-foreground">By Year</p>
                  <div className="bg-blue-500/10 p-2 rounded-full">
                    <Award className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats?.by_year && stats.by_year.length > 0 ? (
                      stats.by_year.map((item) => (
                        <div key={`year-${item.year}`} className="flex justify-between items-center text-sm">
                          <span>Year {item.year}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${Math.max(5, ((item.count / (stats?.total || 1)) * 100))}%`
                                }}
                              />
                            </div>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">{item.count}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm py-2">No data available</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Students by type */}
            <Card className="overflow-hidden border-l-4 border-l-amber-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-medium text-muted-foreground">By Admission Type</p>
                  <div className="bg-amber-500/10 p-2 rounded-full">
                    <User className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats?.by_student_type && stats.by_student_type.length > 0 ? (
                      stats.by_student_type.map((item) => (
                        <div key={`type-${item.student_type}`} className="flex justify-between items-center text-sm">
                          <span>{item.student_type === 'Mgmt' ? 'Management' : 'Government'}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{
                                  width: `${Math.max(5, ((item.count / (stats?.total || 1)) * 100))}%`
                                }}
                              />
                            </div>
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">{item.count}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm py-2">No data available</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Students by degree */}
            <Card className="overflow-hidden border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-medium text-muted-foreground">By Degree</p>
                  <div className="bg-emerald-500/10 p-2 rounded-full">
                    <GraduationCap className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats?.by_degree_type && stats.by_degree_type.length > 0 ? (
                      stats.by_degree_type.map((item) => (
                        <div key={`degree-${item.degree_type}`} className="flex justify-between items-center text-sm">
                          <span>{item.degree_type === 'UG' ? 'Undergraduate' : 'Postgraduate'}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{
                                  width: `${Math.max(5, ((item.count / (stats?.total || 1)) * 100))}%`
                                }}
                              />
                            </div>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">{item.count}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm py-2">No data available</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="mb-6 p-4 bg-background border rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email, roll number..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant={hasActiveFilters ? "default" : "outline"}
                  size="sm"
                  className="h-10"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveFilters && <Badge variant="outline" className="ml-2 bg-primary/20 text-primary">{
                    Object.values([yearFilter, semesterFilter, studentTypeFilter]).filter(Boolean).length
                  }</Badge>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Students</h4>

                  <div className="space-y-2">
                    <label htmlFor="year-filter" className="text-sm font-medium">
                      Year
                    </label>
                    <Select
                      value={yearFilter?.toString() || "all"}
                      onValueChange={handleYearFilterChange}
                    >
                      <SelectTrigger id="year-filter">
                        <SelectValue placeholder="Any Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Year</SelectItem>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                        <SelectItem value="3">Year 3</SelectItem>
                        <SelectItem value="4">Year 4</SelectItem>
                        <SelectItem value="5">Year 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="semester-filter" className="text-sm font-medium">
                      Semester
                    </label>
                    <Select
                      value={semesterFilter?.toString() || "all"}
                      onValueChange={handleSemesterFilterChange}
                    >
                      <SelectTrigger id="semester-filter">
                        <SelectValue placeholder="Any Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Semester</SelectItem>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                        <SelectItem value="3">Semester 3</SelectItem>
                        <SelectItem value="4">Semester 4</SelectItem>
                        <SelectItem value="5">Semester 5</SelectItem>
                        <SelectItem value="6">Semester 6</SelectItem>
                        <SelectItem value="7">Semester 7</SelectItem>
                        <SelectItem value="8">Semester 8</SelectItem>
                        <SelectItem value="9">Semester 9</SelectItem>
                        <SelectItem value="10">Semester 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="type-filter" className="text-sm font-medium">
                      Admission Type
                    </label>
                    <Select
                      value={studentTypeFilter || "all"}
                      onValueChange={handleStudentTypeFilterChange}
                    >
                      <SelectTrigger id="type-filter">
                        <SelectValue placeholder="Any Admission Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Admission Type</SelectItem>
                        <SelectItem value="Mgmt">Management</SelectItem>
                        <SelectItem value="Govt">Government</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                    >
                      Clear Filters
                    </Button>
                    <Button size="sm" onClick={() => setShowFilters(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Display active filters as badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border">
            <div className="flex items-center text-sm text-muted-foreground">
              Active filters:
            </div>
            {yearFilter !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Year: {yearFilter}
                <button
                  onClick={() => setYearFilter(undefined)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </Badge>
            )}
            {semesterFilter !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Semester: {semesterFilter}
                <button
                  onClick={() => setSemesterFilter(undefined)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </Badge>
            )}
            {studentTypeFilter !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {studentTypeFilter === 'Mgmt' ? 'Management' : 'Government'}
                <button
                  onClick={() => setStudentTypeFilter(undefined)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Student Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-950 rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Roll No.</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold">Batch/Sem</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.length ? (
                students.map((student: Student) => (
                  <TableRow
                    key={student.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {student.student_detail?.first_name} {student.student_detail?.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {student.student_detail?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{student.roll_no || 'N/A'}</TableCell>
                    <TableCell>{student.dept_detail?.dept_name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>Batch: {student.batch}</span>
                        <span className="text-xs text-muted-foreground">Sem: {student.current_semester}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.student_type === 'Mgmt' ? 'default' : 'secondary'} className="font-normal">
                        {student.student_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/students/${student.id}/edit`);
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100/50">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Student Record</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this student record? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(student.id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center py-6 text-muted-foreground">
                      <p className="mb-2">No students found</p>
                      {searchTerm && (
                        <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                {data?.count ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, data.count)} of ${data.count}` : 'No results'}
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
        </div>
      )}
    </div>
  );
};

export default StudentManagement; 