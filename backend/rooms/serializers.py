from rest_framework import serializers
from .models import Room
from departments.serializers import DepartmentSerializer

class RoomSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Room
        fields = ('id', 'room_number', 'block', 'description', 'department', 'department_id',
                 'type', 'min_capacity', 'max_capacity', 'has_projector', 'has_ac') 