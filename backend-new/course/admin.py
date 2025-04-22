from django.contrib import admin
from .models import Course

class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_code', 'course_name', 'department', 'course_year', 'course_semester', 'regulation', 'course_type', 'credits')
    search_fields = ('course_code', 'course_name', 'department__name')
    list_filter = ('department', 'course_year', 'course_semester', 'regulation', 'course_type')
    ordering = ('course_code',)

admin.site.register(Course, CourseAdmin)
