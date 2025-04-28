import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const formSchema = z.object({
  room_id: z.coerce.number().min(1, { message: "Room is required" }).optional(),
  preference_level: z.coerce.number().min(1, { message: "Preference level should be at least 1" }).max(10, { message: "Preference level should be at most 10" }),
  preferred_for: z.enum(["GENERAL", "TL", "NTL"]),
  tech_level_preference: z.enum(["None", "Basic", "Advanced", "High-tech"]),
  lab_type: z.enum(["low-end", "mid-end", "high-end"]).optional(),
  specific_lab: z.coerce.number().optional(),
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
  const [roomType, setRoomType] = useState<"GENERAL" | "TL" | "NTL">(
    existingPreference?.preferred_for || "GENERAL"
  );
  const [formError, setFormError] = useState<string | null>(null);
  
  // Filter rooms by type
  const technicalLabRooms = rooms.filter(room => room.room_type?.includes("Technical") || room.room_type?.includes("TL"));
  const nonTechnicalLabRooms = rooms.filter(room => room.room_type?.includes("Non-Technical") || room.room_type?.includes("NTL"));
  const generalRooms = rooms.filter(room => !room.room_type?.includes("Technical") && !room.room_type?.includes("Non-Technical"));
  
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

  // Watch for preferred_for field changes
  const preferredFor = form.watch("preferred_for");
  useEffect(() => {
    setRoomType(preferredFor);
    
    // Reset tech level preference when changing room type
    if (preferredFor === "GENERAL") {
      form.setValue("tech_level_preference", "None");
      // Clear room_id for GENERAL as it's not needed
      form.setValue("room_id", undefined);
    } else if (preferredFor === "TL") {
      form.setValue("lab_type", "low-end");
      form.setValue("tech_level_preference", "Basic");
      // Clear room_id for TL as it's not needed
      form.setValue("room_id", undefined);
    } else if (preferredFor === "NTL") {
      form.setValue("specific_lab", nonTechnicalLabRooms[0]?.id);
      form.setValue("tech_level_preference", "Basic");
    }
  }, [preferredFor, form, nonTechnicalLabRooms, technicalLabRooms]);

  const { mutate: createPreference, isPending: isCreating } = useCreateCourseRoomPreference(
    courseId,
    () => {
      toast.success("Room preference created", {
        description: "Room preference has been created successfully",
      });
      onSuccess?.();
    },
    (error: any) => {
      // Display error as toast notification
      toast.error("Failed to create room preference", {
        description: error?.data?.detail || "An error occurred while creating the room preference",
      });
      // Also set inline error for form context
      if (error?.data) {
        setFormError(error.data.detail || "Failed to create room preference");
      }
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
    },
    (error: any) => {
      // Display error as toast notification
      toast.error("Failed to update room preference", {
        description: error?.data?.detail || "An error occurred while updating the room preference",
      });
      // Also set inline error for form context
      if (error?.data) {
        setFormError(error.data.detail || "Failed to update room preference");
      }
    }
  );

  const isPending = isCreating || isUpdating;

  const onSubmit = (values: FormValues) => {
    // Clear previous errors
    setFormError(null);
    
    // Set technology level based on lab type if it's a technical lab
    if (values.preferred_for === "TL" && values.lab_type) {
      switch (values.lab_type) {
        case "low-end":
          values.tech_level_preference = "Basic";
          break;
        case "mid-end":
          values.tech_level_preference = "Advanced";
          break;
        case "high-end":
          values.tech_level_preference = "High-tech";
          break;
      }
    }
    
    // If non-technical lab is selected, use the specific lab ID as the room_id
    if (values.preferred_for === "NTL" && values.specific_lab) {
      values.room_id = values.specific_lab;
    }
    
    if (isEditing) {
      const { specific_lab, ...updateData } = values;
      updatePreference(updateData);
    } else {
      const { specific_lab, ...createData } = values;
      const data: CreateCourseRoomPreferenceRequest = {
        ...createData,
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
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        {roomType === "NTL" && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              When selecting Non-Technical Lab, you must choose a specific room.
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    Type of room preferred for this course.
                    {field.value === "GENERAL" && " Room selection not required for General preferences."}
                    {field.value === "TL" && " Room selection not required for Technical Lab preferences."}
                    {field.value === "NTL" && " Room selection required for Non-Technical Lab preferences."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {roomType === "TL" && (
              <FormField
                control={form.control}
                name="lab_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Technical Lab Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="low-end" />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-medium">Low-End Lab</FormLabel>
                            <FormDescription className="text-xs">
                              For programming subjects, basic coding, and web development
                            </FormDescription>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="mid-end" />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-medium">Mid-End Lab</FormLabel>
                            <FormDescription className="text-xs">
                              For OS, database, and computation-intensive subjects
                            </FormDescription>
                          </div>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="high-end" />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-medium">High-End Lab</FormLabel>
                            <FormDescription className="text-xs">
                              For ML, NLP, graphics, design, and resource-intensive subjects
                            </FormDescription>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {roomType === "NTL" && (
              <FormField
                control={form.control}
                name="specific_lab"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Specific Lab Room <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a specific lab room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {nonTechnicalLabRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {room.room_number} ({room.block}) - {room.room_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      <span className="font-medium">Required:</span> Select a specific non-technical lab for your course
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>{isEditing ? "Update" : "Save"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 