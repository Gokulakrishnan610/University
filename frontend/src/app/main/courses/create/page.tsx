import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, PlusCircle, BookOpen } from 'lucide-react';
import CourseForm, { CourseFormValues } from '../course-form';
import CourseMasterForm, { CourseMasterFormValues } from '../course-master-form';
import { useGetCourseMasters, useCreateCourseMaster } from '@/action/courseMaster';
import { useGetDepartments, useGetCurrentDepartment } from '@/action/department';
import { useCreateCourse } from '@/action/course';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [courseFormDefaults, setCourseFormDefaults] = useState<Partial<CourseFormValues>>({});
  const [activeTab, setActiveTab] = useState<'course' | 'master'>('course');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [allCourseMasters, setAllCourseMasters] = useState<any[]>([]);
  const pageSize = 10;
  
  const { data: departmentsData, isPending: loadingDepartments } = useGetDepartments();
  const { data: currentDepartment, isPending: loadingCurrentDept } = useGetCurrentDepartment();
  const { 
    data: courseMastersData, 
    isPending: loadingCourseMasters, 
    refetch: refetchCourseMasters 
  } = useGetCourseMasters(page, pageSize, searchTerm);
  
  const departments = departmentsData || [];
  
  // When new course masters are loaded, append them to the existing list
  useEffect(() => {
    if (courseMastersData?.results) {
      if (page === 1) {
        // Reset the list if it's the first page (new search)
        setAllCourseMasters(courseMastersData.results);
      } else {
        // Append to the list for subsequent pages (infinite scroll)
        setAllCourseMasters(prev => {
          // Create a Set of existing IDs to avoid duplicates
          const existingIds = new Set(prev.map(item => item.id));
          // Filter out any duplicates from the new results
          const newItems = courseMastersData.results.filter(item => !existingIds.has(item.id));
          // Return combined list
          return [...prev, ...newItems];
        });
      }
    }
  }, [courseMastersData, page]);
  
  // Reset page to 1 when search term changes
  useEffect(() => {
    setPage(1);
    // When search term changes, the page reset will trigger a reload of data
  }, [searchTerm]);
  
  // Course creation mutation
  const { mutate: createCourse, isPending: isCreatingCourse } = useCreateCourse(() => {
    toast.success("Course created successfully");
    navigate('/courses');
  });
  
  // Course master creation mutation
  const { mutate: createCourseMaster, isPending: isCreatingCourseMaster } = useCreateCourseMaster(() => {
    refetchCourseMasters();
    toast.success("Course master created successfully");
    setActiveTab('course'); // Switch to course tab after creating a master
  });
  
  useEffect(() => {
    if (currentDepartment && currentDepartment.id) {
      // Set both for_dept_id and teaching_dept_id to the current department's ID
      setCourseFormDefaults(prev => ({
        ...prev,
        for_dept_id: currentDepartment.id,
        teaching_dept_id: currentDepartment.id,
      }));
    }
  }, [currentDepartment]);
  
  const handleCreateCourse = (values: CourseFormValues) => {
    createCourse(values);
  };
  
  const handleCreateCourseMaster = (values: CourseMasterFormValues) => {
    createCourseMaster({
      ...values
    });
  };
  
  const handleCancel = () => {
    navigate('/courses');
  };
  
  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, []);
  
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  
  const isLoading = loadingDepartments || loadingCurrentDept;
  
  const totalPages = Math.ceil((courseMastersData?.count || 0) / pageSize);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Create New Course</h1>
        </div>
      </div>
      
      <Tabs defaultValue="course" value={activeTab} onValueChange={(value) => setActiveTab(value as 'course' | 'master')}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="course" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Course from Catalog</span>
          </TabsTrigger>
          <TabsTrigger value="master" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Create New Course Master</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="course">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Create a new course by selecting an existing course from the master catalog and specifying the course details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <CourseForm
                  departments={departments}
                  courseMasters={allCourseMasters}
                  isLoading={isCreatingCourse}
                  isLoadingCourseMasters={loadingCourseMasters}
                  onSubmit={handleCreateCourse}
                  onCancel={handleCancel}
                  submitLabel="Create Course"
                  defaultValues={courseFormDefaults}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  onPageChange={handlePageChange}
                  currentPage={page}
                  totalPages={totalPages}
                  editableFields={[
                    'course_id', 
                    'course_year', 
                    'course_semester', 
                    'for_dept_id', 
                    'need_assist_teacher', 
                    'elective_type', 
                    'teaching_status'
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="master">
          <Card>
            <CardHeader>
              <CardTitle>New Course Master</CardTitle>
              <CardDescription>
                Create a new course in the master catalog. Once created, it can be added to any department's curriculum.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <CourseMasterForm
                  departments={departments}
                  defaultValues={currentDepartment?.id ? { course_dept_id: currentDepartment.id } : undefined}
                  isLoading={isCreatingCourseMaster}
                  onSubmit={handleCreateCourseMaster}
                  onCancel={handleCancel}
                  submitLabel="Create Course Master"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
