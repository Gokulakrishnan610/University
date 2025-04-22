from rest_framework import serializers
from .models import Schedule
from courses.serializers import TeacherCourseSerializer
from rooms.serializers import RoomSerializer

class ScheduleSerializer(serializers.ModelSerializer):
    teacher_course = TeacherCourseSerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    teacher_course_id = serializers.IntegerField(write_only=True)
    room_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Schedule
        fields = ('id', 'teacher_course', 'room', 'teacher_course_id', 'room_id',
                 'day_of_week', 'start_time', 'end_time', 'session_type') 