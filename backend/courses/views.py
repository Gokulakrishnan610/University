from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Course, TeacherCourse, StudentCourse
from .serializers import CourseSerializer, TeacherCourseSerializer, StudentCourseSerializer

# Create your views here.

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Course.objects.all()
        department = self.request.query_params.get('department', None)
        name = self.request.query_params.get('name', None)
        if department:
            queryset = queryset.filter(department_id=department)
        if name:
            queryset = queryset.filter(name__icontains=name)
        return queryset

class TeacherCourseViewSet(viewsets.ModelViewSet):
    queryset = TeacherCourse.objects.all()
    serializer_class = TeacherCourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = TeacherCourse.objects.all()
        teacher = self.request.query_params.get('teacher', None)
        course = self.request.query_params.get('course', None)
        if teacher:
            queryset = queryset.filter(teacher_id=teacher)
        if course:
            queryset = queryset.filter(course_id=course)
        return queryset

class StudentCourseViewSet(viewsets.ModelViewSet):
    queryset = StudentCourse.objects.all()
    serializer_class = StudentCourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = StudentCourse.objects.all()
        student = self.request.query_params.get('student', None)
        course = self.request.query_params.get('course', None)
        status = self.request.query_params.get('status', None)
        if student:
            queryset = queryset.filter(student_id=student)
        if course:
            queryset = queryset.filter(course_id=course)
        if status:
            queryset = queryset.filter(status=status)
        return queryset
