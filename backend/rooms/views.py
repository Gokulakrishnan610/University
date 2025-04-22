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
        building = self.request.query_params.get('building', None)
        room_type = self.request.query_params.get('room_type', None)
        capacity = self.request.query_params.get('capacity', None)
        
        if building:
            queryset = queryset.filter(building__icontains=building)
        if room_type:
            queryset = queryset.filter(room_type=room_type)
        if capacity:
            queryset = queryset.filter(capacity__gte=capacity)
        return queryset
