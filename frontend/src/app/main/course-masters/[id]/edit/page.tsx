import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, BookOpen } from 'lucide-react';
import CourseMasterForm, { CourseMasterFormValues } from '../../../courses/course-master-form';
import { useGetCourseMaster, useUpdateCourseMaster } from '@/action/courseMaster';
import { useGetDepartments } from '@/action/department';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function EditCourseMasterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseMasterId = parseInt(id as string);
  
  const { data: courseMasterResponse, isPending: isLoading } = useGetCourseMaster(courseMasterId);
  const { data: departmentsData, isPending: loadingDepartments } = useGetDepartments();
  
  // Extract course master data from response
  const courseMaster = courseMasterResponse?.data;
  const departments = departmentsData || [];
  
  // Course master update mutation
  const { mutate: updateCourseMaster, isPending: isUpdating } = useUpdateCourseMaster(
    courseMasterId, 
    () => {
      toast.success("Course master updated successfully", {
        description: "The course master has been updated in the catalog."
      });
      navigate(`/course-masters/${courseMasterId}`);
    }
  );
  
  const handleUpdateCourseMaster = (values: CourseMasterFormValues) => {
    updateCourseMaster({
      ...values
    });
  };
  
  const handleCancel = () => {
    navigate(`/course-masters/${courseMasterId}`);
  };
  
  const isPageLoading = isLoading || loadingDepartments;
  
  if (isPageLoading || !courseMaster) {
    return (
      <div className="py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="py-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/course-masters/${courseMasterId}`)}
          className="flex items-center gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Details
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Edit Course Master</CardTitle>
          </div>
          <CardDescription>
            Update information for course {courseMaster.course_id} - {courseMaster.course_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseMasterForm
            departments={departments}
            defaultValues={{
              course_id: courseMaster.course_id,
              course_name: courseMaster.course_name,
              course_dept_id: courseMaster.course_dept_id,
              lecture_hours: courseMaster.lecture_hours,
              tutorial_hours: courseMaster.tutorial_hours,
              practical_hours: courseMaster.practical_hours,
              credits: courseMaster.credits,
              regulation: courseMaster.regulation,
              course_type: courseMaster.course_type as "T" | "L" | "LoT",
              is_zero_credit_course: courseMaster.is_zero_credit_course
            }}
            isLoading={isUpdating}
            onSubmit={handleUpdateCourseMaster}
            onCancel={handleCancel}
            submitLabel="Update Course Master"
          />
        </CardContent>
      </Card>
    </div>
  );
} 