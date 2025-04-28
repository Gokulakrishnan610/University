from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import CourseMaster
from .serializers import CourseMasterSerializer
from rest_framework.permissions import IsAuthenticated
from authentication.authentication import JWTCookieAuthentication
from department.views import get_user_department

# Create your views here.
class CourseMasterListAPIView(generics.ListCreateAPIView):
    authentication_classes=[JWTCookieAuthentication]
    permission_classes=[IsAuthenticated]
    queryset = CourseMaster.objects.all()
    serializer_class = CourseMasterSerializer
    
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
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)