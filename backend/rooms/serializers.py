from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'name', 'capacity', 'room_type', 'building', 'floor', 'created_at', 'updated_at') 