from django.shortcuts import render
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from authentication.authentication import IsAuthenticated
from .models import Student
from .serializers import StudentSerializer
from department.models import Department
from django.db.models import Q

# Create your views here.
class StudentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class StudentListCreateView(generics.ListCreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentSerializer
    pagination_class = StudentPagination

    def get_queryset(self):
        user = self.request.user
        
        try:
            hod_dept = Department.objects.get(hod_id=user)
            queryset = Student.objects.filter(dept_id=hod_dept)
            
            # Handle search
            search_query = self.request.query_params.get('search', None)
            if search_query:
                queryset = queryset.filter(
                    Q(student_detail__first_name__icontains=search_query) |
                    Q(student_detail__last_name__icontains=search_query) |
                    Q(student_detail__email__icontains=search_query) |
                    Q(roll_no__icontains=search_query)
                )
            
            return queryset
        except Department.DoesNotExist:
            return Student.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        try:
            hod_dept = Department.objects.get(hod_id=user)
            
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