from django.contrib import admin
from .models import CourseMaster
from unfold.admin import ModelAdmin

# Register your models here.

@admin.register(CourseMaster)
class CourseMasterAdmin(ModelAdmin):
    list_display = ('course_id', 'course_name', 'course_dept_id')
    search_fields = ('course_id', 'course_name')
    list_filter = ('course_dept_id',)