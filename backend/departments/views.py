from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Department, Teacher
from .serializers import DepartmentSerializer, TeacherSerializer

# Create your views here.

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Department.objects.all()
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(name__icontains=name)
        return queryset

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Teacher.objects.all()
        department = self.request.query_params.get('department', None)
        if department:
            queryset = queryset.filter(department_id=department)
        return queryset
