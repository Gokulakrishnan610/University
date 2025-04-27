import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Room } from "@/action/room";
import {
  CreateCourseRoomPreferenceRequest,
  useCreateCourseRoomPreference,
  useUpdateCourseRoomPreference,
  CourseRoomPreference
} from "@/action/courseRoomPreference";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { toast } from "sonner";

const formSchema = z.object({
  room_id: z.coerce.number().min(1, { message: "Room is required" }),
  preference_level: z.coerce.number().min(1, { message: "Preference level should be at least 1" }).max(10, { message: "Preference level should be at most 10" }),
  preferred_for: z.enum(["GENERAL", "TL", "NTL"]),
  tech_level_preference: z.enum(["None", "Basic", "Advanced", "High-tech"]),
});

type FormValues = z.infer<typeof formSchema>;

interface RoomPreferenceFormProps {
  courseId: number;
  rooms: Room[];
  existingPreference?: CourseRoomPreference;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RoomPreferenceForm({
  courseId,
  rooms,
  existingPreference,
  onSuccess,
  onCancel,
}: RoomPreferenceFormProps) {
  const isEditing = !!existingPreference;
  
  const defaultValues: Partial<FormValues> = existingPreference
    ? {
        room_id: existingPreference.room_id,
        preference_level: existingPreference.preference_level,
        preferred_for: existingPreference.preferred_for,
        tech_level_preference: existingPreference.tech_level_preference,
      }
    : {
        preference_level: 5,
        preferred_for: "GENERAL",
        tech_level_preference: "None",
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { mutate: createPreference, isPending: isCreating } = useCreateCourseRoomPreference(
    courseId,
    () => {
      toast.success("Room preference created", {
        description: "Room preference has been created successfully",
      });
      onSuccess?.();
    }
  );

  const { mutate: updatePreference, isPending: isUpdating } = useUpdateCourseRoomPreference(
    existingPreference?.id || 0,
    courseId,
    () => {
      toast.success("Room preference updated", {
        description: "Room preference has been updated successfully",
      });
      onSuccess?.();
    }
  );

  const isPending = isCreating || isUpdating;

  const onSubmit = (values: FormValues) => {
    if (isEditing) {
      const { room_id, ...updateData } = values;
      updatePreference(updateData);
    } else {
      const data: CreateCourseRoomPreferenceRequest = {
        ...values,
        course_id: courseId,
      };
      createPreference(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Room Preference" : "Add Room Preference"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the preference settings for this room"
            : "Set your preferences for room allocation"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="room_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <Select
                    disabled={isEditing || isPending}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.room_number} ({room.block}) - {room.room_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the room you want to set preferences for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preference_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preference Level (1-10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    1 = lowest priority, 10 = highest priority
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_for"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Room Type</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred room type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="TL">Technical Lab</SelectItem>
                      <SelectItem value="NTL">Non-Technical Lab</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Type of room preferred for this course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tech_level_preference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technology Level Preference</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tech level preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="High-tech">High-tech</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Preferred technology level for this course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 