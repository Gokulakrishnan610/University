import { useState, useEffect } from "react";
import { Room } from "@/action/room";
import {
  useGetCourseRoomPreferences,
  useDeleteCourseRoomPreference,
  CourseRoomPreference
} from "@/action/courseRoomPreference";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, AlertCircle } from "lucide-react";
import { RoomPreferenceForm } from "./RoomPreferenceForm";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGetCourse } from "@/action/course";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RoomPreferenceListProps {
  courseId: number;
  rooms: Room[];
}

export function RoomPreferenceList({ courseId, rooms }: RoomPreferenceListProps) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingPreference, setEditingPreference] = useState<CourseRoomPreference | null>(null);
  const [deletingPreference, setDeletingPreference] = useState<CourseRoomPreference | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionMessage, setPermissionMessage] = useState<string>("");

  const { data: preferences, isPending, refetch } = useGetCourseRoomPreferences(courseId);
  const { data: courseResponse } = useGetCourse(courseId);
  const course = courseResponse?.status === "success" ? courseResponse.data : null;

  // Check if user has permission to modify room preferences
  useEffect(() => {
    if (course) {
      // Check if user's department is in the course permissions
      const canEdit = course.permissions?.can_edit || false;
      const userRoles = course.user_department_roles || [];
      
      // User has permission if:
      // 1. They can edit the course AND
      // 2. They are either the course owner OR the teaching department
      const isOwnerOrTeacher = userRoles.includes('owner') || userRoles.includes('teacher');
      const isForDept = userRoles.includes('for_dept') && !isOwnerOrTeacher;
      
      setHasPermission(canEdit && isOwnerOrTeacher);
      
      if (isForDept) {
        setPermissionMessage("For departments cannot modify room preferences. Only course owner or teaching department can make changes.");
      } else if (!canEdit) {
        setPermissionMessage("You don't have permission to modify room preferences for this course.");
      } else if (!isOwnerOrTeacher) {
        setPermissionMessage("Only the course owner department or teaching department can modify room preferences.");
      }
    }
  }, [course]);

  const { mutate: deletePreference, isPending: isDeleting } = useDeleteCourseRoomPreference(
    deletingPreference?.id || 0,
    courseId,
    () => {
      toast.success("Room preference deleted", {
        description: "Room preference has been deleted successfully",
      });
      setDeletingPreference(null);
      refetch();
    },
    (error: any) => {
      // Display error as toast notification
      toast.error("Failed to delete room preference", {
        description: error?.data?.detail || "An error occurred while deleting the room preference",
      });
      setDeletingPreference(null);
    }
  );

  const handleAddSuccess = () => {
    setIsAddFormOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setEditingPreference(null);
    refetch();
  };

  const handleDeleteConfirm = () => {
    if (deletingPreference) {
      deletePreference({});
    }
  };

  // Map room IDs to room details for easier rendering
  const roomMap = rooms.reduce((acc, room) => {
    acc[room.id] = room;
    return acc;
  }, {} as Record<number, Room>);

  // Function to get readable names for enums
  const getRoomTypeName = (type: string) => {
    switch (type) {
      case "GENERAL": return "General";
      case "TL": return "Computer Lab";
    case "NTL": return "Core Lab";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {hasPermission === false && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Permission Denied</AlertTitle>
          <AlertDescription>{permissionMessage}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Room Preferences</CardTitle>
            <CardDescription>
              Manage room preferences for this course
            </CardDescription>
          </div>
          {hasPermission && (
            <Button onClick={() => setIsAddFormOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Add Preference
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading preferences...
            </div>
          ) : !preferences || preferences.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No room preferences set. {hasPermission ? "Add one to get started." : ""}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Preference Level</TableHead>
                  <TableHead>Preferred For</TableHead>
                  <TableHead>Tech Level</TableHead>
                  {hasPermission && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preferences.map((pref: CourseRoomPreference) => {
                  const room = pref.room_id ? roomMap[pref.room_id] : null;
                  return (
                    <TableRow key={pref.id}>
                      <TableCell>
                        {room ? (
                          <>
                            {room.room_number} ({room.block})
                            <div className="text-xs text-muted-foreground">
                              {room.room_type}
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {pref.preferred_for === 'NTL' ? `Room ID: ${pref.room_id}` : 'N/A'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{pref.preference_level}</TableCell>
                      <TableCell>{getRoomTypeName(pref.preferred_for)}</TableCell>
                      <TableCell>{pref.tech_level_preference}</TableCell>
                      {hasPermission && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingPreference(pref)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingPreference(pref)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isAddFormOpen && hasPermission && (
        <RoomPreferenceForm
          courseId={courseId}
          rooms={rooms}
          onSuccess={handleAddSuccess}
          onCancel={() => setIsAddFormOpen(false)}
        />
      )}

      {editingPreference && hasPermission && (
        <RoomPreferenceForm
          courseId={courseId}
          rooms={rooms}
          existingPreference={editingPreference}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingPreference(null)}
        />
      )}

      <AlertDialog
        open={!!deletingPreference}
        onOpenChange={(open) => !open && setDeletingPreference(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this room preference. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 