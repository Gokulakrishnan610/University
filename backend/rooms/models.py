from django.db import models
from departments.models import Department

class RoomType(models.TextChoices):
    ROOM = 'Room', 'Room'
    TL = 'TL', 'TL'
    NTL = 'NTL', 'NTL'

class Room(models.Model):
    room_number = models.CharField(max_length=20, unique=True)
    block = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    type = models.CharField(max_length=4, choices=RoomType.choices)
    min_capacity = models.IntegerField(null=True, blank=True)
    max_capacity = models.IntegerField(null=True, blank=True)
    has_projector = models.BooleanField(default=False)
    has_ac = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.room_number} ({self.get_type_display()})"
