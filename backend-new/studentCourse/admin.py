from django.contrib import admin
from .models import StudentCourse

class StudentCourseAdmin(admin.ModelAdmin):
    list_display = ('student', 'course')
    search_fields = ('student__student__email', 'student__student__first_name', 'course__course_code', 'course__course_name')
    list_filter = ('course__department', 'course__course_year', 'course__course_semester')
    ordering = ('student', 'course')

admin.site.register(StudentCourse, StudentCourseAdmin)
