import { useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { DepartmentDetails } from '@/action/course';

// Form schema for course master creation
const courseMasterFormSchema = z.object({
  course_id: z.string().min(1, "Course ID is required"),
  course_name: z.string().min(1, "Course Name is required"),
  course_dept_id: z.coerce.number().positive("Please select a department").optional(),
});

export type CourseMasterFormValues = z.infer<typeof courseMasterFormSchema>;

export interface CourseMasterFormProps {
  departments: DepartmentDetails[];
  defaultValues?: Partial<CourseMasterFormValues>;
  isLoading: boolean;
  onSubmit: (values: CourseMasterFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function CourseMasterForm({
  departments,
  defaultValues,
  isLoading,
  onSubmit,
  onCancel,
  submitLabel = 'Create Course',
}: CourseMasterFormProps) {
  const form = useForm<CourseMasterFormValues>({
    resolver: zodResolver(courseMasterFormSchema),
    defaultValues: {
      course_id: '',
      course_name: '',
      course_dept_id: 0,
      ...defaultValues
    }
  });

  // Reset form when defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...form.getValues(),
        ...defaultValues
      });
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="course_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course ID</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. CS101" />
                </FormControl>
                <FormDescription>
                  The unique identifier for this course (e.g., CS101, MATH201)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="course_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Introduction to Computer Science" />
                </FormControl>
                <FormDescription>
                  The full name of the course as it will appear in the catalog
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="course_dept_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value ? field.value.toString() : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
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
                  The department that owns this course and controls its curriculum
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
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