import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import CourseMasterForm from '../../courses/course-master-form';
import { useGetDepartments, useGetCurrentDepartment } from '@/action/department';
import { useCreateCourseMaster } from '@/action/courseMaster';
import { CourseMasterFormValues } from '../../courses/course-master-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function CreateCourseMasterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { data: departments, isPending: loadingDepartments } = useGetDepartments();
  const { data: currentDepartment, isPending: loadingCurrentDept } = useGetCurrentDepartment();
  const { mutate: createCourseMaster } = useCreateCourseMaster();

  const handleSubmit = async (values: CourseMasterFormValues) => {
    try {
      setIsLoading(true);
      await createCourseMaster(values);
      toast.success("Course master created successfully");
      navigate('/course-masters');
    } catch (error) {
      toast.error("Failed to create course master");
    } finally {
      setIsLoading(false);
    }
  };

  const isLoadingData = loadingDepartments || loadingCurrentDept;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Create New Course Master</h1>
        </div>
      </div>

      <Card>
        <CardHeader className='flex flex-row justify-between items-center'>
          <div className='gap-y-4'>
            <CardTitle>New Course Master</CardTitle>
            <CardDescription>
              Create a new course in the master catalog. Once created, it can be added to any department's curriculum.
            </CardDescription>
          </div>
          <div>
            <Button variant="default" onClick={() => navigate('/course-masters')}>
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Course Masters</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <CourseMasterForm
              departments={departments || []}
              defaultValues={currentDepartment?.id ? { 
                course_dept_id: currentDepartment.id,
                regulation: "R2019",
                course_type: "T"
              } : undefined}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/course-masters')}
              submitLabel="Create Course Master"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 