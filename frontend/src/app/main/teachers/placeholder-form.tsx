import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCreatePlaceholderTeacher } from '@/action/teacher';
import { useGetDepartments } from '@/action/department';
import { useCurrentUser } from '@/action/authentication';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Building, User, BookOpen, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect } from 'react';

const TEACHER_ROLES = [
  'Professor',
  'Asst. Professor',
  'HOD',
  'DC',
  'POP',
  'Industry Professional'
];

const formSchema = z.object({
  staff_code: z.string().optional(),
  teacher_role: z.string({ required_error: 'Role is required' }),
  teacher_specialisation: z.string().optional(),
  teacher_working_hours: z.number({ required_error: 'Working hours is required' }).min(1),
  dept_id: z.number(),
  placeholder_description: z.string().min(1, "Description is required"),
});

interface TeacherPlaceholderFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TeacherPlaceholderForm({ onClose, onSuccess }: TeacherPlaceholderFormProps) {
  const { data: departmentsData, isPending: loadingDepartments } = useGetDepartments();
  const departments = departmentsData || [];
  const { data: currentUser } = useCurrentUser();
  
  const { mutate: createPlaceholder, isPending: isCreating } = useCreatePlaceholderTeacher(onSuccess);

  // Setup form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staff_code: '',
      teacher_role: 'Professor',
      teacher_specialisation: '',
      teacher_working_hours: 21,
      dept_id: undefined,
      placeholder_description: '',
    },
  });
  
  // Set default department to current user's department when data is loaded
  useEffect(() => {
    if (currentUser?.teacher?.department?.id) {
      form.setValue('dept_id', currentUser.teacher.department.id);
    }
  }, [currentUser, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createPlaceholder(values);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Create Placeholder Teacher
          </DialogTitle>
          <DialogDescription>
            Create a placeholder for a teacher position that needs to be filled
          </DialogDescription>
        </DialogHeader>

        <Separator />
        <ScrollArea className='h-[calc(100vh-200px)]'>
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
                    <FormLabel>Position Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. PH-001" {...field} className="focus-visible:ring-primary" />
                    </FormControl>
                    <FormDescription>
                      Optional identifier for this placeholder position
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

              <FormField
                control={form.control}
                name="dept_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        disabled={loadingDepartments || currentUser?.teacher?.department?.id !== undefined}
                      >
                        <SelectTrigger className="focus-visible:ring-primary">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.dept_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {currentUser?.teacher?.department ? 
                        "Using your department" : 
                        "Department this position belongs to"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teacher_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="focus-visible:ring-primary">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEACHER_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      The teaching role for this position
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-md font-medium">Required Qualifications</h3>
              </div>

              <FormField
                control={form.control}
                name="teacher_specialisation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialisation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Machine Learning, Database Systems" {...field} className="focus-visible:ring-primary" />
                    </FormControl>
                    <FormDescription>
                      Required specialisation for this position
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="placeholder_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the requirements and responsibilities for this position"
                        className="focus-visible:ring-primary resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of the position requirements
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-md font-medium">Workload</h3>
              </div>

              <FormField
                control={form.control}
                name="teacher_working_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Working Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={40}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormDescription>
                      Required weekly working hours for this position
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Placeholder
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 