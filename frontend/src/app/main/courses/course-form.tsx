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
import { CourseMaster } from '@/action/courseMaster';
import { DepartmentDetails, Course } from '@/action/course';

// Form schema for course creation and editing
export const courseFormSchema = z.object({
  course_id: z.coerce.number().positive("Please select a course"),
  course_year: z.coerce.number().min(1, "Year must be at least 1").max(10, "Year must be 10 or less"),
  course_semester: z.coerce.number().min(1, "Semester must be at least 1").max(8, "Semester must be 8 or less"),
  lecture_hours: z.coerce.number().min(0, "Lecture hours cannot be negative"),
  tutorial_hours: z.coerce.number().min(0, "Tutorial hours cannot be negative"),
  practical_hours: z.coerce.number().min(0, "Practical hours cannot be negative"),
  credits: z.coerce.number().min(0, "Credits cannot be negative"),
  for_dept_id: z.coerce.number().positive("Please select a department"),
  teaching_dept_id: z.coerce.number().positive("Please select a teaching department"),
  need_assist_teacher: z.boolean().default(false),
  regulation: z.string().min(1, "Regulation is required"),
  course_type: z.enum(["T", "L", "LoT"]),
  elective_type: z.enum(["NE", "PE", "OE"]),
  lab_type: z.enum(["NULL", "TL", "NTL"]).optional(),
  no_of_students: z.coerce.number().min(0, "Student count cannot be negative"),
  is_zero_credit_course: z.boolean().default(false),
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
}

export default function CourseForm({
  departments,
  courseMasters,
  defaultValues,
  isLoading,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  isEdit = false
}: CourseFormProps) {
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
      for_dept_id: 0,
      teaching_dept_id: 0,
      need_assist_teacher: false,
      regulation: "R-2021",
      course_type: "T",
      elective_type: "NE",
      lab_type: "NULL",
      no_of_students: 60,
      is_zero_credit_course: false,
      teaching_status: "active",
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
                <FormLabel>Course</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value as any}
                  disabled={isEdit}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseMasters.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.course_id} - {course.course_name}
                      </SelectItem>
                    ))}
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
            name="course_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
            name="for_dept_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>For Department</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value.toString()}
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
                  Department whose students will take this course
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="teaching_dept_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teaching Department</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value.toString()}
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
                  Department responsible for teaching this course
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
            name="no_of_students"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Students</FormLabel>
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
            name="regulation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regulation</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
        </div>
        
        <div className="grid grid-cols-3 gap-4">
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
          
          <FormField
            control={form.control}
            name="lab_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lab Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "NULL"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NULL">None</SelectItem>
                    <SelectItem value="TL">Technical Lab</SelectItem>
                    <SelectItem value="NTL">Non-Technical Lab</SelectItem>
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
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
        
        <div className="flex justify-end gap-2">
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