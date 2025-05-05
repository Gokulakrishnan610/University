import { useParams, useNavigate } from 'react-router';
import { useGetCourse } from "@/action/course";
import { useGetRooms } from "@/action/room";
import { RoomPreferenceList } from "@/app/main/courses/[id]/room-preferences/RoomPreferenceList";;

export default function CourseRoomPreferencesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id as string);

  const { data: courseResponse, isPending: isLoadingCourse } = useGetCourse(courseId);
  const { data: rooms, isPending: isLoadingRooms } = useGetRooms("Non-Technical");
  
  // Extract course data from the response
  const course = courseResponse?.status === "success" ? courseResponse.data : null;

  if (isLoadingCourse || isLoadingRooms) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-muted-foreground">Course not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <RoomPreferenceList courseId={courseId} rooms={rooms || []} />
    </div>
  );
} 