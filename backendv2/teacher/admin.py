from django.contrib import admin
from .models import Teacher

class TeacherAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'dept', 'staff_code', 'teacher_specialisation', 'teacher_working_hours')
    search_fields = ('teacher__email', 'teacher__first_name', 'teacher__last_name', 'staff_code', 'teacher_specialisation')
    list_filter = ('dept', 'teacher_working_hours')
    ordering = ('staff_code',)

admin.site.register(Teacher, TeacherAdmin)
