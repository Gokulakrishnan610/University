from django.contrib import admin
from .models import Room

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'block', 'department', 'type', 'min_capacity', 'max_capacity', 'has_projector', 'has_ac')
    search_fields = ('room_number', 'block')
    list_filter = ('department', 'type', 'has_projector', 'has_ac')
    ordering = ('block', 'room_number')
