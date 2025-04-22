from rest_framework import serializers
from .models import Schedule

class ScheduleSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)

    class Meta:
        model = Schedule
        fields = ('id', 'course', 'teacher', 'room', 'course_name', 'teacher_name', 'room_name',
                 'day_of_week', 'start_time', 'end_time', 'created_at', 'updated_at') 