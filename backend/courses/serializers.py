from rest_framework import serializers
from .models import Course, TeacherCourse, StudentCourse
from departments.serializers import DepartmentSerializer, TeacherSerializer

class CourseSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Course
        fields = ('id', 'department', 'department_id', 'course_code', 'course_name',
                 'year', 'semester', 'regulation', 'category', 'lecture_hours',
                 'tutorial_hours', 'practical_hours', 'credits')

class TeacherCourseSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    teacher_id = serializers.IntegerField(write_only=True)
    course_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = TeacherCourse
        fields = ('id', 'teacher', 'course', 'teacher_id', 'course_id',
                 'student_count', 'academic_year', 'semester')

class StudentCourseSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    course = CourseSerializer(read_only=True)
    teacher_course = TeacherCourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True)
    teacher_course_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = StudentCourse
        fields = ('id', 'student', 'course', 'teacher_course',
                 'course_id', 'teacher_course_id', 'enrollment_date', 'grade')

    def get_student(self, obj):
        return {
            'id': obj.student.id,
            'username': obj.student.user.username,
            'name': obj.student.user.name,
            'enrollment_number': obj.student.enrollment_number
        }