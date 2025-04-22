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
        if username:
            queryset = queryset.filter(username__icontains=username)
        if email:
            queryset = queryset.filter(email__icontains=email)
        return queryset

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Student.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        user_id = self.request.query_params.get('user_id', None)
        if student_id:
            queryset = queryset.filter(student_id__icontains=student_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset
