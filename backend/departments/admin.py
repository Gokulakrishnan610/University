from django.contrib import admin
from .models import Department, Teacher

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('dept_name', 'hod', 'established_date', 'contact_info')
    search_fields = ('dept_name', 'contact_info')
    list_filter = ('established_date',)
    raw_id_fields = ('hod',)
    ordering = ('dept_name',)

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('staff_code', 'user', 'department', 'role', 'specialization')
    search_fields = ('staff_code', 'user__username', 'specialization')
    list_filter = ('department', 'role')
    raw_id_fields = ('user', 'department')
