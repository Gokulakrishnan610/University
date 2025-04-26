from django.shortcuts import render
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from authentication.authentication import IsAuthenticated
from .models import Student
from .serializers import StudentSerializer
from department.models import Department

# Create your views here.
class StudentListCreateView(generics.ListCreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentSerializer

    def get_queryset(self):
        user = self.request.user
        
        try:
            hod_dept = Department.objects.get(hod_id=user)
            return Student.objects.filter(dept_id=hod_dept)
        except Department.DoesNotExist:
            return Student.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        try:
            hod_dept = Department.objects.get(hod_id=user)
            student_user = serializer.validated_data['student_id']
            
            if serializer.validated_data.get('dept_id') != hod_dept:
                raise serializers.ValidationError(
                    "You can only add students to your own department"
                )
                
            serializer.save()
        except Department.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "Only HOD can create student records."}
            )

class StudentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        
        try:
            hod_dept = Department.objects.get(hod_id=user)
            return Student.objects.filter(dept_id=hod_dept)
        except Department.DoesNotExist:
            return Student.objects.none()

    def perform_update(self, serializer):
        user = self.request.user
        try:
            hod_dept = Department.objects.get(hod_id=user)
            instance = self.get_object()
            
            if 'dept_id' in serializer.validated_data:
                if serializer.validated_data['dept_id'] != hod_dept:
                    raise serializers.ValidationError(
                        {"dept_id": "You can only manage students from your department"}
                    )
            
            serializer.save()
        except Department.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "Only HOD can update student records."}
            )