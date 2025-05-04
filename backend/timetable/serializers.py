from rest_framework import serializers
from .models import Timetable, TimetableChange
from teacherCourse.serializers import TeacherCourseSerializer
from slot.serializers import SlotSerializer
from rooms.serializers import RoomSerializer

class TimetableSerializer(serializers.ModelSerializer):
    course_assignment = TeacherCourseSerializer(read_only=True)
    slot = SlotSerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    day_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Timetable
        fields = '__all__'


class TimetableWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timetable
        fields = '__all__'


class TimetableChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimetableChange
        fields = '__all__'
        read_only_fields = ('created_at',) 