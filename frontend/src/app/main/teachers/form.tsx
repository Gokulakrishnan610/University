import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  useUpdateTeacher,
  Teacher as TeacherType,
} from '@/action/teacher';
import { useGetDepartments } from '@/action/department';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Building, User, BookOpen, Clock } from 'lucide-react';

const TEACHER_ROLES = [
  'Professor',
  'Asst. Professor',
  'HOD',
  'DC',
];

const formSchema = z.object({
  staff_code: z.string().optional(),
  teacher_role: z.string({ required_error: 'Role is required' }),
  teacher_specialisation: z.string().optional(),
  teacher_working_hours: z.number({ required_error: 'Working hours is required' }).min(1),
  dept: z.number().nullable().optional(),
});

interface TeacherFormProps {
  teacher: TeacherType;
  onClose: () => void;
  onSuccess?: () => void;
  disableDepartmentEdit?: boolean;
}

export default function TeacherForm({ teacher, onClose, onSuccess, disableDepartmentEdit }: TeacherFormProps) {
  const { data: departmentsData, isPending: loadingDepartments } = useGetDepartments();
  const departments = departmentsData || [];

  // @ts-ignore - Ensure we can access ID regardless of structure
  const teacherId = teacher.id;

  const { mutate: updateTeacher, isPending: isUpdating } = useUpdateTeacher(
    teacherId,
    onSuccess
  );

  // Get department data safely
  // @ts-ignore - Safely access properties that might have different names
  const departmentData = teacher.dept || teacher.dept_id;
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Create a submission data object with the correct type structure
    const submissionData: any = { ...values };
    
    // Rename field to match what the API expects
    if ('dept' in submissionData) {
      submissionData.dept_id = submissionData.dept;
      delete submissionData.dept;
    }
    
    if (disableDepartmentEdit) {
      // @ts-ignore - Access department ID safely
      submissionData.dept_id = departmentData?.id || null;
    }

    updateTeacher(submissionData);
  };

  // Get the department name for display, using type assertion to handle property access safely
  const getDepartmentName = () => {
    const dept = (teacher as any).dept || (teacher as any).dept_id;
    return dept?.dept_name || 'No department assigned';
  };
  
  // Extract department id for the form default value
  const getDepartmentId = () => {
    const dept = (teacher as any).dept || (teacher as any).dept_id;
    return dept?.id || null;
  };

  // Setup form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staff_code: teacher.staff_code || '',
      teacher_role: teacher.teacher_role || 'Professor',
      teacher_specialisation: teacher.teacher_specialisation || '',
      teacher_working_hours: teacher.teacher_working_hours || 21,
      // @ts-ignore - Access department ID safely
      dept: departmentData?.id || null,
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Edit Teacher Profile
          </DialogTitle>
          <DialogDescription>
            Update teacher details and information
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="text-md font-medium">Basic Information</h3>
              </div>

              <FormField
                control={form.control}
                name="staff_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. TCH001" {...field} className="focus-visible:ring-primary" />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for the teacher within the institution
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                <h3 className="text-md font-medium">Department & Role</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {disableDepartmentEdit ? (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {/* @ts-ignore - Access department name safely */}
                      <span>{departmentData?.dept_name || 'No department assigned'}</span>
                    </div>
                    <FormDescription>
                      Department cannot be changed directly. Use the Remove from Department option if needed.
                    </FormDescription>
                  </FormItem>
                ) : (
                  <FormField
                    control={form.control}
                    name="dept"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          defaultValue={field.value ? String(field.value) : undefined}
                          value={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="focus-visible:ring-primary">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingDepartments ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : departments.length > 0 ? (
                              departments.map((dept: any) => (
                              <SelectItem key={dept.id} value={String(dept.id)}>
                                {dept.dept_name}
                              </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-muted-foreground">No departments found</div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="teacher_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="focus-visible:ring-primary">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TEACHER_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                <FormField
                  control={form.control}
                  name="teacher_specialisation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                      <Input placeholder="e.g. Database Systems, Artificial Intelligence" {...field} className="focus-visible:ring-primary" />
                      </FormControl>
                    <FormDescription>
                      Teacher's area of expertise or specialization
                    </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-md font-medium">Working Hours</h3>
              </div>

                <FormField
                  control={form.control}
                  name="teacher_working_hours"
                  render={({ field }) => (
                    <FormItem>
                    <FormLabel>Weekly Working Hours</FormLabel>
                      <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="focus-visible:ring-primary" 
                          />
                      </FormControl>
                    <FormDescription>
                      Number of working hours per week for this teacher
                    </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 