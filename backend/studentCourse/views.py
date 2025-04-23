from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from authentication.authentication import IsAuthenticated
from .models import StudentCourse
from .serializers import StudentCourseSerializer
from department.models import Department

# Create your views here.
class StudentCourseListCreateView(generics.ListCreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentCourseSerializer

    def get_queryset(self):
        user = self.request.user
        
        try:
            hod_dept = Department.objects.get(hod=user)
            return StudentCourse.objects.filter(
                student__dept=hod_dept,
                course__department=hod_dept
            )
        except Department.DoesNotExist:
            return StudentCourse.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        try:
            hod_dept = Department.objects.get(hod=user)
            student = serializer.validated_data['student']
            course = serializer.validated_data['course']
            
            if student.dept != hod_dept:
                raise self.serializer_class.ValidationError(
                    "Only HOD can create student course enrollments"
                )
                
            serializer.save()
        except Department.DoesNotExist:
            raise self.serializer_class.ValidationError(
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
            hod_dept = Department.objects.get(hod=user)
            return StudentCourse.objects.filter(
                student__dept=hod_dept,
                course__department=hod_dept
            )
        except Department.DoesNotExist:
            return StudentCourse.objects.none()

    def perform_update(self, serializer):
        user = self.request.user
        try:
            hod_dept = Department.objects.get(hod=user)
            instance = self.get_object()
            
            serializer.save()
        except Department.DoesNotExist:
            raise self.serializer_class.ValidationError(
                {"detail": "Only HOD can update student course enrollments."}
            )