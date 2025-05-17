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
import { useCreateTeacherWithUser } from '@/action/teacher';
import { useGetDepartments } from '@/action/department';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Building, User, BookOpen, Clock, Mail, Phone } from 'lucide-react';

const TEACHER_ROLES = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Asst. Professor',
  'HOD',
  'DC',
  'POP',
  'Industry Professional',
  'Dean',
  'Admin',
  'Vice Principal',
  'Principal',
  'Physical Director'
];

// Special roles that typically have unique institution-wide positions
const UNIQUE_ROLES = ['Dean', 'Principal', 'Vice Principal', 'Physical Director'];

const AVAILABILITY_TYPES = [
  { value: 'regular', label: 'Regular (All Working Days)' },
  { value: 'limited', label: 'Limited (Specific Days/Times)' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const formSchema = z.object({
  user: z.object({
    email: z.string().email('Invalid email address'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    phone_number: z.string().optional(),
    gender: z.string().optional(),
  }),
  dept_id: z.number({ required_error: 'Department is required' }),
  staff_code: z.string().optional(),
  teacher_role: z.string({ required_error: 'Role is required' }),
  teacher_specialisation: z.string().optional(),
  teacher_working_hours: z.number({ required_error: 'Working hours is required' }).min(1),
  availability_type: z.enum(['regular', 'limited']).default('regular'),
});

interface CreateTeacherFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTeacherForm({ onClose, onSuccess }: CreateTeacherFormProps) {
  const { data: departmentsData, isPending: loadingDepartments } = useGetDepartments();
  const departments = departmentsData || [];

  // New state to track if a unique role warning should be shown
  const [showUniqueRoleWarning, setShowUniqueRoleWarning] = useState(false);

  const { mutate: createTeacherWithUser, isPending: isCreating } = useCreateTeacherWithUser(onSuccess);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Add default password
    const data = {
      ...values,
      user: {
        ...values.user,
        password: 'changeme',
      },
    };
    createTeacherWithUser(data);
  };

  // Setup form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: {
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        gender: '',
      },
      staff_code: '',
      teacher_role: 'Professor',
      teacher_specialisation: '',
      teacher_working_hours: 21,
      dept_id: undefined,
      availability_type: 'regular',
    },
  });

  const teacherRole = form.watch('teacher_role');

  useEffect(() => {
    if (teacherRole === 'POP' || teacherRole === 'Industry Professional') {
      form.setValue('availability_type', 'limited');
    }

    // Show warning for unique roles
    setShowUniqueRoleWarning(UNIQUE_ROLES.includes(teacherRole));
  }, [teacherRole, form]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Create New Teacher
          </DialogTitle>
          <DialogDescription>
            Add a new teacher to the system
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="user.first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} className="focus-visible:ring-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user.last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} className="focus-visible:ring-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="user.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} className="focus-visible:ring-primary" />
                      </FormControl>
                      <FormDescription>
                        This will be used for login. Default password is set to 'changeme'
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="user.phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} className="focus-visible:ring-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user.gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="focus-visible:ring-primary">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GENDER_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
                  <FormField
                    control={form.control}
                    name="dept_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
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
                              <div className="p-2 text-sm text-muted-foreground">
                                No departments available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Department this teacher belongs to
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
                        <FormDescription>
                          {field.value === 'POP' || field.value === 'Industry Professional'
                            ? 'Industry professionals have limited availability'
                            : UNIQUE_ROLES.includes(field.value)
                              ? 'This role is typically unique within the institution'
                              : 'The teaching role for this position'
                          }
                        </FormDescription>
                        {showUniqueRoleWarning && (
                          <div className="mt-2 text-xs text-amber-600">
                            Note: {field.value} is typically a unique role. The system may prevent creating if another teacher with this role already exists.
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h3 className="text-md font-medium">Qualifications & Workload</h3>
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
                        Teacher's area of expertise or specialisation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          Weekly working hours for this teacher
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={teacherRole === 'POP' || teacherRole === 'Industry Professional'}
                        >
                          <FormControl>
                            <SelectTrigger className="focus-visible:ring-primary">
                              <SelectValue placeholder="Select availability type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AVAILABILITY_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {teacherRole === 'POP' || teacherRole === 'Industry Professional'
                            ? 'Industry professionals always have limited availability'
                            : 'Type of availability for this teacher'
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Teacher
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 