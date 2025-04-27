import { useState } from "react";
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
import { Pencil, Trash2, Plus } from "lucide-react";
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

interface RoomPreferenceListProps {
  courseId: number;
  rooms: Room[];
}

export function RoomPreferenceList({ courseId, rooms }: RoomPreferenceListProps) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingPreference, setEditingPreference] = useState<CourseRoomPreference | null>(null);
  const [deletingPreference, setDeletingPreference] = useState<CourseRoomPreference | null>(null);

  const { data: preferences, isPending, refetch } = useGetCourseRoomPreferences(courseId);

  const { mutate: deletePreference } = useDeleteCourseRoomPreference(
    deletingPreference?.id || 0,
    courseId,
    () => {
      toast.success("Room preference deleted", {
        description: "Room preference has been deleted successfully",
      });
      setDeletingPreference(null);
      refetch();
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
      case "TL": return "Technical Lab";
      case "NTL": return "Non-Technical Lab";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Room Preferences</CardTitle>
            <CardDescription>
              Manage room preferences for this course
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddFormOpen(true)} className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            Add Preference
          </Button>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading preferences...
            </div>
          ) : !preferences || preferences.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No room preferences set. Add one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Preference Level</TableHead>
                  <TableHead>Preferred For</TableHead>
                  <TableHead>Tech Level</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preferences.map((pref: CourseRoomPreference) => {
                  const room = roomMap[pref.room_id];
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
                          `Room ID: ${pref.room_id}`
                        )}
                      </TableCell>
                      <TableCell>{pref.preference_level}</TableCell>
                      <TableCell>{getRoomTypeName(pref.preferred_for)}</TableCell>
                      <TableCell>{pref.tech_level_preference}</TableCell>
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isAddFormOpen && (
        <RoomPreferenceForm
          courseId={courseId}
          rooms={rooms}
          onSuccess={handleAddSuccess}
          onCancel={() => setIsAddFormOpen(false)}
        />
      )}

      {editingPreference && (
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