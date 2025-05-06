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
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { DepartmentDetails } from '@/action/course';

// Form schema for course master creation
const courseMasterFormSchema = z.object({
  course_id: z.string().min(1, "Course ID is required"),
  course_name: z.string().min(1, "Course Name is required"),
  course_dept_id: z.coerce.number().positive("Please select a department"),
  lecture_hours: z.coerce.number().min(0, "Lecture hours cannot be negative"),
  tutorial_hours: z.coerce.number().min(0, "Tutorial hours cannot be negative"),
  practical_hours: z.coerce.number().min(0, "Practical hours cannot be negative"),
  credits: z.coerce.number().min(0, "Credits cannot be negative"),
  regulation: z.string().min(1, "Regulation is required"),
  course_type: z.enum(["T", "L", "LoT"]),
  is_zero_credit_course: z.boolean().default(false),
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
      lecture_hours: 3,
      tutorial_hours: 0,
      practical_hours: 0,
      credits: 3,
      regulation: "R2019",
      course_type: "T",
      is_zero_credit_course: false,
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
                  disabled={true}
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

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="lecture_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lecture Hours</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="regulation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regulation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="course_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="T">Theory</SelectItem>
                    <SelectItem value="L">Lab</SelectItem>
                    <SelectItem value="LoT">Lab & Theory</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_zero_credit_course"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Zero Credit Course</FormLabel>
                  <FormDescription>
                    Indicate if this is a zero credit course
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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