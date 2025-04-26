from django.contrib import admin
from .models import CourseMaster

# Register your models here.

@admin.register(CourseMaster)
class CourseMasterAdmin(admin.ModelAdmin):
    list_display = ('course_id', 'course_name', 'course_dept_id')
    search_fields = ('course_id', 'course_name')
    list_filter = ('course_dept_id',)