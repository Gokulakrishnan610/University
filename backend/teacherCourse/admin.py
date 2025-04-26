from django.contrib import admin
from .models import TeacherCourse

class TeacherCourseAdmin(admin.ModelAdmin):
    list_display = ('teacher_id', 'course_id', 'academic_year', 'semester', 'student_count')
    list_filter = ('academic_year', 'semester', 'teacher_id__dept_id', 'course_id__course_id')
    search_fields = ('teacher_id__teacher_id__email', 'course_id__course_id__course_id', 'course_id__course_id__course_name')

admin.site.register(TeacherCourse, TeacherCourseAdmin)
