from django.shortcuts import render
from rest_framework import generics
from .models import Room
from .serializers import RoomSerializer
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

class RoomListAPIView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def get_queryset(self):
        room_type = self.request.query_params.get('room_type', None)
        if not room_type:
            return Response(
                {
                    "detail": "Invalid Room Type",
                    "code": "invalid_room_type",
                },status=status.HTTP_400_BAD_REQUEST
            )
        rooms = Room.objects.filter(room_type=room_type)
        if not rooms.exists():
            return Response(
                {
                    "detail": "No Rooms Found",
                    "code": "no_rooms_found",
                },status=status.HTTP_404_NOT_FOUND
            )
        return rooms