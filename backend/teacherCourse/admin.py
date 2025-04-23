from django.contrib import admin
from .models import TeacherCourse

class TeacherCourseAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'course', 'student_count', 'academic_year', 'semester')
    search_fields = ('teacher__teacher__email', 'teacher__teacher__first_name', 'course__dept_name')
    list_filter = ('academic_year', 'semester', 'course')
    ordering = ('academic_year', 'semester', 'teacher')

admin.site.register(TeacherCourse, TeacherCourseAdmin)
