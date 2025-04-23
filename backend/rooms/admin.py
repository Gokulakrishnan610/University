from django.contrib import admin
from .models import Room

class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'block', 'maintained_by', 'is_lab', 'room_type', 'room_min_cap', 'room_max_cap', 'has_projector', 'has_ac')
    search_fields = ('room_number', 'block', 'description')
    list_filter = ('block', 'is_lab', 'room_type', 'has_projector', 'has_ac', 'maintained_by')
    ordering = ('block', 'room_number')

admin.site.register(Room, RoomAdmin)
