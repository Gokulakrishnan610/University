from django.shortcuts import render
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from authentication.authentication import IsAuthenticated
from .models import StudentCourse
from .serializers import StudentCourseSerializer
from department.models import Department
from utlis.pagination import PagePagination

# Create your views here.
class StudentCourseListCreateView(generics.ListCreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentCourseSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        user = self.request.user
        
        try:
            hod_dept = Department.objects.get(hod_id=user)
            return StudentCourse.objects.filter(
                student_id__dept_id=hod_dept,
                course_id__for_dept_id=hod_dept
            )
        except Department.DoesNotExist:
            return StudentCourse.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        try:
            hod_dept = Department.objects.get(hod_id=user)
            student = serializer.validated_data['student_id']
            course = serializer.validated_data['course_id']
            
            if student.dept_id != hod_dept:
                raise serializers.ValidationError(
                    "Only HOD can create student course enrollments"
                )
                
            serializer.save()
        except Department.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "Only HOD can create student course enrollments."}
            )

class StudentCourseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentCourseSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        
        try:
            hod_dept = Department.objects.get(hod_id=user)
            return StudentCourse.objects.filter(
                student_id__dept_id=hod_dept,
                course_id__for_dept_id=hod_dept
            )
        except Department.DoesNotExist:
            return StudentCourse.objects.none()

    def perform_update(self, serializer):
        user = self.request.user
        try:
            hod_dept = Department.objects.get(hod_id=user)
            instance = self.get_object()
            
            serializer.save()
        except Department.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "Only HOD can update student course enrollments."}
            )