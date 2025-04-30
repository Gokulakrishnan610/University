from django.shortcuts import render, get_object_or_404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import CourseMaster
from .serializers import CourseMasterSerializer
from rest_framework.permissions import IsAuthenticated
from authentication.authentication import JWTCookieAuthentication
from department.views import get_user_department
from utlis.pagination import PagePagination

# Create your views here.
class CourseMasterListAPIView(generics.ListCreateAPIView):
    authentication_classes=[JWTCookieAuthentication]
    permission_classes=[IsAuthenticated]
    queryset = CourseMaster.objects.all()
    serializer_class = CourseMasterSerializer
    pagination_class = PagePagination
    
    def get_queryset(self):
        queryset = CourseMaster.objects.all()
        
        # Allow filtering by department
        department_id = self.request.query_params.get('department_id', None)
        if department_id is not None:
            queryset = queryset.filter(course_dept_id=department_id)
            
        # Allow filtering by course type
        course_type = self.request.query_params.get('course_type', None)
        if course_type is not None:
            queryset = queryset.filter(course_type=course_type)
            
        return queryset
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        
        # If course_dept_id is not provided, use the user's department
        if 'course_dept_id' not in data or not data['course_dept_id']:
            department_id, _ = get_user_department(request.user)
            
            if not department_id:
                return Response({
                    "status": "error",
                    "detail": "User has no associated department. Please provide a course_dept_id."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            data['course_dept_id'] = department_id
        
        # Set default values for new fields if not provided
        if 'is_zero_credit_course' not in data:
            data['is_zero_credit_course'] = False
        if 'lecture_hours' not in data:
            data['lecture_hours'] = 0
        if 'practical_hours' not in data:
            data['practical_hours'] = 0
        if 'tutorial_hours' not in data:
            data['tutorial_hours'] = 0
        if 'credits' not in data:
            data['credits'] = 0
        if 'regulation' not in data:
            data['regulation'] = "0"
        if 'course_type' not in data:
            data['course_type'] = "T"  # Default to Theory
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response({
                "status": "success",
                "message": "Course master created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED, headers=headers)
        return Response({
            "status": "error",
            "detail": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class CourseMasterDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CourseMasterSerializer
    queryset = CourseMaster.objects.all()
    lookup_field = 'pk'
    
    def get_object(self):
        pk = self.kwargs.get('pk')
        return get_object_or_404(CourseMaster, pk=pk)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "status": "success",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check permissions - only allow updates if user is from the department that owns the course
        department_id, is_hod = get_user_department(request.user)
        if not department_id or (instance.course_dept_id.id != department_id and not request.user.is_superuser):
            return Response({
                "status": "error",
                "detail": "You do not have permission to update this course master."
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({
                "status": "success",
                "message": "Course master updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            "status": "error",
            "detail": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check permissions - only allow deletion if user is HOD from the department that owns the course
        department_id, is_hod = get_user_department(request.user)
        if not is_hod or (instance.course_dept_id.id != department_id and not request.user.is_superuser):
            return Response({
                "status": "error",
                "detail": "Only department HODs can delete course masters."
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            self.perform_destroy(instance)
            return Response({
                "status": "success",
                "message": "Course master deleted successfully"
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({
                "status": "error",
                "detail": "Cannot delete course master as it may be in use.",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)