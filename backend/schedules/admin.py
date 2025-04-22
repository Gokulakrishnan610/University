from django.contrib import admin
from .models import Schedule

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('teacher_course', 'room', 'day_of_week', 'start_time', 'end_time', 'session_type')
    search_fields = ('teacher_course__teacher__staff_code', 'teacher_course__course__course_code', 'room__room_number')
    list_filter = ('day_of_week', 'session_type')
    raw_id_fields = ('teacher_course', 'room')
    ordering = ('day_of_week', 'start_time')
