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
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  useCreateTeacher, 
  useUpdateTeacher, 
  useGetDepartments,
  Teacher,
  CreateTeacherRequest,
  useCurrentUser,
  Department,
  UserDetails
} from '@/action';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

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
}

export default function TeacherForm({ teacher, mode, onClose, onSuccess }: TeacherFormProps) {
  const { data: departmentsData } = useGetDepartments();
  const { data: profile } = useCurrentUser();
  
  const departments = departmentsData?.data || [];
  
  const { mutate: createTeacher, isPending: isCreating } = useCreateTeacher(onSuccess);
  const { mutate: updateTeacher, isPending: isUpdating } = useUpdateTeacher(
    teacher?.id || 0,
    onSuccess
  );
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacher: teacher?.teacher?.id || profile?.user?.id || 0,
      dept: teacher?.dept?.id || 0,
      staff_code: teacher?.staff_code || '',
      teacher_role: teacher?.teacher_role || 'Professor',
      teacher_specialisation: teacher?.teacher_specialisation || '',
      teacher_working_hours: teacher?.teacher_working_hours || 21,
    },
  });
  
  const isPending = isCreating || isUpdating;
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (mode === 'create') {
      createTeacher(values as CreateTeacherRequest);
    } else {
      updateTeacher(values);
    }
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Teacher' : 'Edit Teacher'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new teacher to the system'
              : 'Update the teacher details'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="staff_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. TCH001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="teacher_specialisation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Artificial Intelligence" {...field} />
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
                      <Input 
                        type="number" 
                        min={1} 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Create Teacher' : 'Update Teacher'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 