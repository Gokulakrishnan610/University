import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useGetCourse } from "@/action/course";
import { useGetRooms } from "@/action/room";
import { RoomPreferenceList } from "@/app/main/courses/[id]/room-preferences/RoomPreferenceList";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function CourseRoomPreferencesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id as string);

  const { data: courseResponse, isPending: isLoadingCourse } = useGetCourse(courseId);
  const { data: rooms, isPending: isLoadingRooms } = useGetRooms();
  
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
      <div className="flex flex-col gap-2">
        <div className="flex text-sm text-muted-foreground">
          <span 
            className="hover:underline cursor-pointer" 
            onClick={() => navigate('/main/courses')}
          >
            Courses
          </span>
          <span className="mx-2">/</span>
          <span 
            className="hover:underline cursor-pointer" 
            onClick={() => navigate(`/main/courses/${courseId}`)}
          >
            {course.course_id?.course_id || `Course ${courseId}`}
          </span>
          <span className="mx-2">/</span>
          <span className="text-foreground">Room Preferences</span>
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Room Preferences for {course.course_id?.course_name || `Course ${courseId}`}
          </h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/main/courses/${courseId}`)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </div>

      <RoomPreferenceList courseId={courseId} rooms={rooms || []} />
    </div>
  );
} 