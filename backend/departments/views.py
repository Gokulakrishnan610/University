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
        dept_name = self.request.query_params.get('dept_name', None)
        if dept_name:
            queryset = queryset.filter(dept_name__icontains=dept_name)
        return queryset

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Teacher.objects.all()
        staff_code = self.request.query_params.get('staff_code', None)
        department = self.request.query_params.get('department', None)
        role = self.request.query_params.get('role', None)
        
        if staff_code:
            queryset = queryset.filter(staff_code__icontains=staff_code)
        if department:
            queryset = queryset.filter(department_id=department)
        if role:
            queryset = queryset.filter(role=role)
        return queryset
