from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Schedule
from .serializers import ScheduleSerializer

# Create your views here.

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Schedule.objects.all()
        teacher_course = self.request.query_params.get('teacher_course', None)
        room = self.request.query_params.get('room', None)
        day = self.request.query_params.get('day_of_week', None)
        session_type = self.request.query_params.get('session_type', None)
        
        if teacher_course:
            queryset = queryset.filter(teacher_course_id=teacher_course)
        if room:
            queryset = queryset.filter(room_id=room)
        if day:
            queryset = queryset.filter(day_of_week=day)
        if session_type:
            queryset = queryset.filter(session_type=session_type)
        return queryset
