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
  useCreateTeacher, 
  useUpdateTeacher, 
  Teacher,
  CreateTeacherRequest,
  UserDetails
} from '@/action/teacher';
import { useGetDepartments, Department } from '@/action/department';
import { useCurrentUser } from '@/action';
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
  teacher: z.number({ required_error: 'User is required' }),
  dept: z.number({ required_error: 'Department is required' }),
  staff_code: z.string().optional(),
  teacher_role: z.string({ required_error: 'Role is required' }),
  teacher_specialisation: z.string().optional(),
  teacher_working_hours: z.number({ required_error: 'Working hours is required' }).min(1),
});

interface TeacherFormProps {
  teacher?: Teacher;
  mode: 'create' | 'update';
  onClose: () => void;
  onSuccess?: () => void;
  disableDepartmentEdit?: boolean;
}

export default function TeacherForm({ teacher, mode, onClose, onSuccess, disableDepartmentEdit }: TeacherFormProps) {
  const { data: departmentsData } = useGetDepartments();
  const { data: currentUser } = useCurrentUser();
  
  const departments = departmentsData || [];
  
  const { mutate: createTeacher, isPending: isCreating } = useCreateTeacher(onSuccess);
  const { mutate: updateTeacher, isPending: isUpdating } = useUpdateTeacher(
    teacher?.id || 0,
    onSuccess
  );
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacher: teacher?.teacher?.id || (currentUser?.user?.id || 0),
      dept: teacher?.dept?.id || 0,
      staff_code: teacher?.staff_code || '',
      teacher_role: teacher?.teacher_role || 'Professor',
      teacher_specialisation: teacher?.teacher_specialisation || '',
      teacher_working_hours: teacher?.teacher_working_hours || 21,
    },
  });
  
  useEffect(() => {
    if (mode === 'update' && teacher) {
      form.reset({
        teacher: teacher.teacher.id,
        dept: teacher.dept?.id || 0,
        staff_code: teacher.staff_code || '',
        teacher_role: teacher.teacher_role || 'Professor',
        teacher_specialisation: teacher.teacher_specialisation || '',
        teacher_working_hours: teacher.teacher_working_hours || 21,
      });
    }
  }, [form, mode, teacher]);
  
  const isPending = isCreating || isUpdating;
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (mode === 'create') {
      createTeacher(values as CreateTeacherRequest);
    } else if (mode === 'update') {
      updateTeacher(values);
    }
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {mode === 'create' ? (
              <>
                <User className="h-5 w-5 text-primary" />
                Create New Teacher
              </>
            ) : (
              <>
                <User className="h-5 w-5 text-primary" />
                Edit Teacher Profile
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new teacher to your department'
              : 'Update teacher details and information'}
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
                {mode === 'update' && disableDepartmentEdit ? (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{teacher?.dept?.dept_name || 'No department assigned'}</span>
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
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="focus-visible:ring-primary">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dept: Department) => (
                              <SelectItem key={dept.id} value={String(dept.id)}>
                                {dept.dept_name}
                              </SelectItem>
                            ))}
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
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-md font-medium">Professional Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="teacher_specialisation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Artificial Intelligence" {...field} className="focus-visible:ring-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="teacher_working_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Working Hours (per week)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            min={1} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="pr-10 focus-visible:ring-primary"
                          />
                          <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} className="gap-2">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2 bg-primary hover:bg-primary/90">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Create Teacher' : 'Update Teacher'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 