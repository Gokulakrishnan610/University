import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { Course } from '@/action/course';
import { useRequestCourseReassignment } from '@/action/course';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  teaching_dept_id: z.string({
    required_error: "Please select a department",
  }),
  allocation_reason: z.string()
    .min(10, {
      message: "Reason must be at least 10 characters.",
    })
    .max(500, {
      message: "Reason must not be longer than 500 characters.",
    }),
});

interface ReassignDialogProps {
  course: Course;
  departments: Array<{ id: number; dept_name: string }>;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReassignDialog({
  course,
  departments,
  open,
  onClose,
  onSuccess
}: ReassignDialogProps) {
  const [error, setError] = useState<string | null>(null);
  
  // Determine if user is from the teaching department but not the owner
  const userRoles = course.user_department_roles || [];
  const isTeacherNotOwner = userRoles.includes('teacher') && !userRoles.includes('owner');
  
  const { mutate: requestReassignment, isPending } = useRequestCourseReassignment((response) => {
    if (!response.error) {
      onClose();
      if (onSuccess) onSuccess();
      toast.success("Reassignment request sent", {
        description: "The department will be notified about your request."
      });
    } else {
      const errorData = response.error;
      if (errorData.code === 'duplicate_request') {
        toast.error("Reassignment request not sent", {
          description: "A request for this course with the selected department already exists.",
          richColors:true
        });
      } else if (errorData.code === 'already_teaching') {
        toast.error("Reassignment request not sent", {
          description: "This department is already teaching this course.",
          richColors:true
        });
    
      } else {
        toast.error("Reassignment request not sent", {
          description: "Failed to send request. Please try again.",
          richColors:true
        });
      }
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teaching_dept_id: "",
      allocation_reason: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    setError(null);
    
    // Check if trying to assign to current teaching department
    if (parseInt(values.teaching_dept_id) === course.teaching_dept_id) {
      setError("This department is already teaching this course.");
      return;
    }
    
    requestReassignment({
      course_id: course.id,
      teaching_dept_id: parseInt(values.teaching_dept_id),
      allocation_reason: values.allocation_reason,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            {isTeacherNotOwner ? "Request Teaching Reassignment" : "Reassign Course Teaching"}
          </DialogTitle>
          <DialogDescription>
            {isTeacherNotOwner 
              ? "Request that this course be reassigned to another department." 
              : "Request another department to teach this course for you."}
          </DialogDescription>
        </DialogHeader>


        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Course Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Course ID:</span>
                    <p className="font-medium">{course.course_detail.course_id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Course Name:</span>
                    <p className="font-medium">{course.course_detail.course_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Teaching Dept:</span>
                    <p className="font-medium">{course.teaching_dept_detail.dept_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">For Department:</span>
                    <p className="font-medium">{course.for_dept_detail.dept_name}</p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="teaching_dept_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Department</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setError(null);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments
                          .filter((dept) => dept.id !== course.teaching_dept_id)
                          .map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.dept_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isTeacherNotOwner
                        ? "Choose the department you want to take over teaching this course"
                        : "Choose the department you want to teach this course"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allocation_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Reassignment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={isTeacherNotOwner
                          ? "Please explain why this course should be reassigned..."
                          : "Please explain why you want to reassign this course..."}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a clear explanation for the department to understand your request
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
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 