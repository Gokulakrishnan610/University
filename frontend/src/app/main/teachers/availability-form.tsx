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
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Calendar, Clock } from 'lucide-react';
import { 
  useCreateAvailability, 
  useUpdateAvailability, 
  TeacherAvailability,
  Teacher as TeacherType 
} from '@/action/teacher';

const DAYS_OF_WEEK = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" },
];

const timeMask = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const formSchema = z.object({
  day_of_week: z.string({ required_error: 'Day is required' }),
  start_time: z.string({ required_error: 'Start time is required' })
    .regex(timeMask, 'Time format must be HH:MM'),
  end_time: z.string({ required_error: 'End time is required' })
    .regex(timeMask, 'Time format must be HH:MM')
}).refine(data => {
  const [startHour, startMinute] = data.start_time.split(':').map(Number);
  const [endHour, endMinute] = data.end_time.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return endMinutes > startMinutes;
}, {
  message: "End time must be after start time",
  path: ["end_time"]
});

interface AvailabilityFormProps {
  teacher: TeacherType;
  availability?: TeacherAvailability;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AvailabilityForm({ 
  teacher, 
  availability, 
  isOpen, 
  onClose, 
  onSuccess 
}: AvailabilityFormProps) {
  const isEdit = !!availability;
  
  const { mutate: createAvailability, isPending: isCreating } = useCreateAvailability(onSuccess);
  const { mutate: updateAvailability, isPending: isUpdating } = useUpdateAvailability(
    availability?.id || 0,
    teacher.id,
    onSuccess
  );
  
  const isPending = isCreating || isUpdating;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day_of_week: availability ? String(availability.day_of_week) : "",
      start_time: availability?.start_time || "",
      end_time: availability?.end_time || "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const data = {
      ...values,
      day_of_week: parseInt(values.day_of_week),
    };

    if (isEdit && availability) {
      // Update existing availability
      updateAvailability(data);
    } else {
      // Create new availability
      createAvailability({
        ...data,
        teacher: teacher.id,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-primary" />
            {isEdit ? 'Edit Availability' : 'Add Availability Slot'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Update the time slot when this teacher is available' 
              : 'Add a time slot when this teacher is available to teach'}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="day_of_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="focus-visible:ring-primary">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="HH:MM (e.g. 09:00)" 
                        {...field}
                        className="focus-visible:ring-primary" 
                      />
                    </FormControl>
                    <FormDescription>
                      24-hour format (e.g. 14:30)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="HH:MM (e.g. 17:00)" 
                        {...field}
                        className="focus-visible:ring-primary" 
                      />
                    </FormControl>
                    <FormDescription>
                      24-hour format (e.g. 17:30)
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
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update' : 'Add'} Availability
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 