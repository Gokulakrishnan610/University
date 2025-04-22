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
        course_code = self.request.query_params.get('course_code', None)
        course_name = self.request.query_params.get('course_name', None)
        department = self.request.query_params.get('department', None)
        year = self.request.query_params.get('year', None)
        semester = self.request.query_params.get('semester', None)
        category = self.request.query_params.get('category', None)
        
        if course_code:
            queryset = queryset.filter(course_code__icontains=course_code)
        if course_name:
            queryset = queryset.filter(course_name__icontains=course_name)
        if department:
            queryset = queryset.filter(department_id=department)
        if year:
            queryset = queryset.filter(year=year)
        if semester:
            queryset = queryset.filter(semester=semester)
        if category:
            queryset = queryset.filter(category=category)
        return queryset

class TeacherCourseViewSet(viewsets.ModelViewSet):
    queryset = TeacherCourse.objects.all()
    serializer_class = TeacherCourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = TeacherCourse.objects.all()
        teacher = self.request.query_params.get('teacher', None)
        course = self.request.query_params.get('course', None)
        academic_year = self.request.query_params.get('academic_year', None)
        semester = self.request.query_params.get('semester', None)
        
        if teacher:
            queryset = queryset.filter(teacher_id=teacher)
        if course:
            queryset = queryset.filter(course_id=course)
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)
        if semester:
            queryset = queryset.filter(semester=semester)
        return queryset

class StudentCourseViewSet(viewsets.ModelViewSet):
    queryset = StudentCourse.objects.all()
    serializer_class = StudentCourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = StudentCourse.objects.all()
        student = self.request.query_params.get('student', None)
        course = self.request.query_params.get('course', None)
        teacher_course = self.request.query_params.get('teacher_course', None)
        grade = self.request.query_params.get('grade', None)
        
        if student:
            queryset = queryset.filter(student_id=student)
        if course:
            queryset = queryset.filter(course_id=course)
        if teacher_course:
            queryset = queryset.filter(teacher_course_id=teacher_course)
        if grade:
            queryset = queryset.filter(grade=grade)
        return queryset
