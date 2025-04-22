from django.contrib import admin
from .models import Course, TeacherCourse, StudentCourse

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_name', 'course_code', 'department', 'credits', 'year', 'semester')
    search_fields = ('course_name', 'course_code')
    list_filter = ('department', 'semester', 'year', 'category')
    ordering = ('course_code',)

@admin.register(TeacherCourse)
class TeacherCourseAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'course', 'student_count', 'academic_year', 'semester')
    search_fields = ('teacher__user__username', 'course__course_code')
    list_filter = ('semester', 'academic_year')
    raw_id_fields = ('teacher', 'course')

@admin.register(StudentCourse)
class StudentCourseAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'teacher_course', 'enrollment_date', 'grade')
    search_fields = ('student__user__username', 'course__course_code')
    list_filter = ('enrollment_date', 'grade')
    raw_id_fields = ('student', 'course', 'teacher_course')
