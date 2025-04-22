from rest_framework import serializers
from .models import Course, TeacherCourse, StudentCourse
from departments.serializers import DepartmentSerializer, TeacherSerializer
from users.serializers import UserSerializer

class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Course
        fields = ('id', 'name', 'code', 'description', 'credits', 'department', 'department_name', 'created_at', 'updated_at')

class TeacherCourseSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    
    class Meta:
        model = TeacherCourse
        fields = ('id', 'teacher', 'course', 'teacher_name', 'course_name', 'created_at', 'updated_at')

class StudentCourseSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    
    class Meta:
        model = StudentCourse
        fields = ('id', 'student', 'course', 'student_name', 'course_name', 'status', 'created_at', 'updated_at') 