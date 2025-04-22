from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Room
from .serializers import RoomSerializer

# Create your views here.

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Room.objects.all()
        room_number = self.request.query_params.get('room_number', None)
        block = self.request.query_params.get('block', None)
        department = self.request.query_params.get('department', None)
        room_type = self.request.query_params.get('type', None)
        has_projector = self.request.query_params.get('has_projector', None)
        has_ac = self.request.query_params.get('has_ac', None)
        
        if room_number:
            queryset = queryset.filter(room_number__icontains=room_number)
        if block:
            queryset = queryset.filter(block__icontains=block)
        if department:
            queryset = queryset.filter(department_id=department)
        if room_type:
            queryset = queryset.filter(type=room_type)
        if has_projector is not None:
            queryset = queryset.filter(has_projector=has_projector.lower() == 'true')
        if has_ac is not None:
            queryset = queryset.filter(has_ac=has_ac.lower() == 'true')
        return queryset
