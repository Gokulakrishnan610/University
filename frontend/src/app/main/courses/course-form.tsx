import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { CourseMaster } from '@/action/courseMaster';
import { DepartmentDetails, Course } from '@/action/course';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchableDropdown, DropdownOption } from '@/components/ui/searchable-dropdown';
import { Checkbox } from '@/components/ui/checkbox';

// Form schema for course creation and editing
export const courseFormSchema = z.object({
  course_id: z.coerce.number().positive("Please select a course").optional(),
  course_year: z.coerce.number().min(1, "Year must be at least 1").max(10, "Year must be 10 or less"),
  course_semester: z.coerce.number().min(1, "Semester must be at least 1").max(8, "Semester must be 8 or less"),
  // Fields below come from CourseMaster and are read-only in Course
  lecture_hours: z.coerce.number().optional(),
  tutorial_hours: z.coerce.number().optional(),
  practical_hours: z.coerce.number().optional(),
  credits: z.coerce.number().optional(),
  for_dept_id: z.coerce.number().positive("Please select a department"),
  teaching_dept_id: z.coerce.number().positive("Please select a teaching department"),
  need_assist_teacher: z.boolean().default(false),
  regulation: z.string().optional(),
  course_type: z.enum(["T", "L", "LoT"]).optional(),
  elective_type: z.enum(["NE", "PE", "OE"]),
  lab_type: z.enum(["NULL", "TL", "NTL"]).optional(),
  is_zero_credit_course: z.boolean().optional(),
  teaching_status: z.enum(["active", "inactive", "pending"])
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export interface CourseFormProps {
  departments: DepartmentDetails[];
  courseMasters: CourseMaster[];
  defaultValues?: Partial<CourseFormValues>;
  isLoading: boolean;
  onSubmit: (values: CourseFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  isEdit?: boolean;
  editableFields?: string[];
  searchTerm?: string;
  onSearchChange?: (searchTerm: string) => void;
  onPageChange?: (page: number) => void;
  isLoadingCourseMasters?: boolean;
  currentPage?: number;
  totalPages?: number;
}

export default function CourseForm({
  departments,
  courseMasters: initialCourseMasters,
  defaultValues,
  isLoading,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  isEdit = false,
  editableFields = [],
  searchTerm,
  onSearchChange,
  onPageChange,
  isLoadingCourseMasters,
  currentPage = 1,
  totalPages: parentTotalPages = 1
}: CourseFormProps) {
  const [searchTermState, setSearchTermState] = useState(searchTerm || '');
  const debouncedSearchTerm = useDebounce(searchTermState, 300);
  const [page, setPage] = useState(currentPage);
  const pageSize = 10;

  useEffect(() => {
    if (onSearchChange && debouncedSearchTerm !== searchTerm) {
      onSearchChange(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearchChange, searchTerm]);
  
  useEffect(() => {
    if (onPageChange && page !== currentPage) {
      onPageChange(page);
    }
  }, [page, onPageChange, currentPage]);
  
  useEffect(() => {
    if (currentPage !== page) {
      setPage(currentPage);
    }
  }, [currentPage]);
  const totalResults = initialCourseMasters?.length || 0;
  const calculatedTotalPages = Math.ceil(totalResults / pageSize);
  
  const totalPages = parentTotalPages || calculatedTotalPages;
  
  const courseOptions: DropdownOption[] = initialCourseMasters?.map((course) => ({
    value: course.id.toString(),
    label: `${course.course_id} - ${course.course_name} (${course.course_dept_detail.dept_name})`
  })) || [];


  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      course_id: 0,
      course_year: 1,
      course_semester: 1,
      lecture_hours: 3,
      tutorial_hours: 0,
      practical_hours: 0,
      credits: 3,
      for_dept_id: defaultValues?.for_dept_id || 0,
      teaching_dept_id: defaultValues?.teaching_dept_id || 0,
      need_assist_teacher: false,
      regulation: "R2019",
      course_type: "T",
      elective_type: "NE",
      lab_type: "NULL",
      is_zero_credit_course: false,
      teaching_status: "active",
    }
  });

  useEffect(() => {
    if (defaultValues) {
      // Instead of just merging, do a complete reset to ensure all values are properly initialized
      form.reset({
        // Start with the form's default values
        course_id: 0,
        course_year: 1,
        course_semester: 1,
        lecture_hours: 3,
        tutorial_hours: 0,
        practical_hours: 0,
        credits: 3,
        for_dept_id: 0,
        teaching_dept_id: 0,
        need_assist_teacher: false,
        regulation: "R2019",
        course_type: "LoT",
        elective_type: "NE",
        lab_type: "NULL",
        is_zero_credit_course: false,
        teaching_status: "active",
        // Override with provided default values
        ...defaultValues
      });
      
      console.log('Reset form with defaultValues:', defaultValues);
    }
  }, [defaultValues, form]);

  const isFieldEditable = (fieldName: string): boolean => {
    // In create mode, disable for_dept_id
    if (!isEdit && fieldName === 'for_dept_id') return false;
    
    // In edit mode, check if the field is in the editable fields list
    if (isEdit) {
      return editableFields.length === 0 || editableFields.includes(fieldName);
    }
    
    // In create mode for other fields
    return editableFields.length === 0 || editableFields.includes(fieldName);
  };

  // Add effect to handle course master selection
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'course_id' && value.course_id) {
        const selectedCourse:any = initialCourseMasters.find(course => course.id === value.course_id);
        if (selectedCourse) {
          // Set values for pre-populated fields from CourseMaster
          form.setValue('lecture_hours', selectedCourse.lecture_hours);
          form.setValue('tutorial_hours', selectedCourse.tutorial_hours);
          form.setValue('practical_hours', selectedCourse.practical_hours);
          form.setValue('credits', selectedCourse.credits);
          form.setValue('course_type', selectedCourse.course_type);
          form.setValue('is_zero_credit_course', selectedCourse.is_zero_credit_course);
          form.setValue('regulation', selectedCourse.regulation);
          
          // NOTE: We don't set department values here to preserve the current user's department
          // settings that were initialized from defaultValues

          // Update form with validation
          form.setValue('lecture_hours', selectedCourse.lecture_hours, { shouldValidate: true, shouldDirty: true });
          form.setValue('tutorial_hours', selectedCourse.tutorial_hours, { shouldValidate: true, shouldDirty: true });
          form.setValue('practical_hours', selectedCourse.practical_hours, { shouldValidate: true, shouldDirty: true });
          form.setValue('credits', selectedCourse.credits, { shouldValidate: true, shouldDirty: true });
          form.setValue('course_type', selectedCourse.course_type, { shouldValidate: true, shouldDirty: true });
          form.setValue('is_zero_credit_course', selectedCourse.is_zero_credit_course, { shouldValidate: true, shouldDirty: true });
          form.setValue('regulation', selectedCourse.regulation, { shouldValidate: true, shouldDirty: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, initialCourseMasters]);

  const handleSubmit = (values: z.infer<typeof courseFormSchema>) => {
    if (isEdit && defaultValues?.course_id) {
      values.course_id = defaultValues.course_id;
    }
    
    // Remove fields that don't exist in the Course model anymore
    // These fields are now in CourseMaster and should not be submitted
    const submissionValues = {
      ...values,
      lecture_hours: undefined,
      tutorial_hours: undefined,
      practical_hours: undefined,
      credits: undefined,
      regulation: undefined,
      course_type: undefined,
      is_zero_credit_course: undefined,
      lab_type: undefined
    };
    
    onSubmit(submissionValues as z.infer<typeof courseFormSchema>);
  };

  
  // Function to handle page changes properly
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (newPage <= totalPages || totalPages === 0)) {
      setPage(newPage);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 py-4">
        {/* Course Selection Section */}
        {!isEdit && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Course Selection</h3>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <div className="space-y-4">
                      <SearchableDropdown
                        options={courseOptions}
                        value={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => {
                          field.onChange(parseInt(value));
                        }}
                        placeholder="Select a course"
                        searchPlaceholder="Search courses..."
                        emptyMessage={isLoadingCourseMasters ? "Loading..." : "No courses found."}
                        className="w-full"
                        onSearchChange={setSearchTermState}
                        searchValue={searchTermState}
                        onPageChange={handlePageChange}
                        currentPage={page}
                        totalPages={totalPages}
                        isLoading={isLoadingCourseMasters}
                      />
                    </div>
                    <FormDescription>
                      Selecting a course also selects its owning department that controls the curriculum
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
        
        {/* Basic Course Information */}
        <div className="space-y-4 ">
          <h3 className="text-lg font-medium">Basic Course Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="course_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={false} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="course_semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={false} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Department Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Department Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {defaultValues?.for_dept_id !== undefined && (
              <FormField
                control={form.control}
                name="for_dept_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>For Department</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={defaultValues.for_dept_id ? defaultValues.for_dept_id.toString() : ''}
                      disabled={!isFieldEditable('for_dept_id')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.dept_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {!isEdit 
                        ? "When creating a course, it is assigned to your department's students by default."
                        : "Department whose students will take this course as part of their curriculum"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {defaultValues?.teaching_dept_id !== undefined && (
              <FormField
                control={form.control}
                name="teaching_dept_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teaching Department</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={defaultValues.teaching_dept_id ? defaultValues.teaching_dept_id.toString() : ''}
                      disabled={!isFieldEditable('teaching_dept_id')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.dept_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Your department is automatically set as the teaching department. Use resource allocation to request changes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
        
        {/* Course Structure - Read Only */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Course Structure</h3>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Read-only</span>
          </div>
          
          <div className="p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200 mb-4">
            <p className="text-sm">The following fields are managed in CourseMaster and cannot be edited here.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="lecture_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lecture Hours</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={true} className="bg-muted/40" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tutorial_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tutorial Hours</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={true} className="bg-muted/40" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="practical_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Practical Hours</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={true} className="bg-muted/40" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credits</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={true} className="bg-muted/40" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_zero_credit_course"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel>Zero Credit Course</FormLabel>
                    <FormDescription>
                      Indicates if this is a zero credit course
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      disabled={true}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {defaultValues?.regulation !== undefined && (
              <FormField
                control={form.control}
                name="regulation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regulation</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ''} 
                      disabled={true}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted/40">
                          <SelectValue placeholder="Select regulation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="R2019">R2019</SelectItem>
                        <SelectItem value="R2023">R2023</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {(
              <FormField
                control={form.control}
                name="course_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ''}
                      disabled={true}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted/40">
                          <SelectValue placeholder="Select course type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="T">Theory</SelectItem>
                        <SelectItem value="L">Lab</SelectItem>
                        <SelectItem value="LoT">Lab and Theory</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
        
        {/* Course Classification */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Course Classification</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="teaching_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="elective_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Elective Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NE">Non-Elective</SelectItem>
                      <SelectItem value="PE">Professional Elective</SelectItem>
                      <SelectItem value="OE">Open Elective</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Additional Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Additional Settings</h3>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="need_assist_teacher"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Needs Assistant Teacher</FormLabel>
                    <FormDescription>
                      Indicate if this course requires an assistant teacher
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 