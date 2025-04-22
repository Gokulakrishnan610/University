from django.shortcuts import render
from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from .models import Student
from .serializers import UserSerializer, StudentSerializer

User = get_user_model()

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = User.objects.all()
        username = self.request.query_params.get('username', None)
        email = self.request.query_params.get('email', None)
        user_type = self.request.query_params.get('user_type', None)
        
        if username:
            queryset = queryset.filter(username__icontains=username)
        if email:
            queryset = queryset.filter(email__icontains=email)
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        return queryset

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Student.objects.all()
        enrollment_number = self.request.query_params.get('enrollment_number', None)
        program = self.request.query_params.get('program', None)
        batch_year = self.request.query_params.get('batch_year', None)
        current_semester = self.request.query_params.get('current_semester', None)
        
        if enrollment_number:
            queryset = queryset.filter(enrollment_number__icontains=enrollment_number)
        if program:
            queryset = queryset.filter(program__icontains=program)
        if batch_year:
            queryset = queryset.filter(batch_year=batch_year)
        if current_semester:
            queryset = queryset.filter(current_semester=current_semester)
        return queryset
