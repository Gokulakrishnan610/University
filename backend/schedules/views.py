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
        course = self.request.query_params.get('course', None)
        teacher = self.request.query_params.get('teacher', None)
        room = self.request.query_params.get('room', None)
        day = self.request.query_params.get('day_of_week', None)
        
        if course:
            queryset = queryset.filter(course_id=course)
        if teacher:
            queryset = queryset.filter(teacher_id=teacher)
        if room:
            queryset = queryset.filter(room_id=room)
        if day:
            queryset = queryset.filter(day_of_week=day)
        return queryset
