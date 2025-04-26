from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Department
from .serializers import DepartmentSerializer
from authentication.authentication import JWTCookieAuthentication
from rest_framework.permissions import IsAuthenticated
from course.models import Course
from course.serializers import CourseSerializer
from authentication.models import User
from teacher.models import Teacher
from student.models import Student

class DepartmentListCreateView(ListCreateAPIView):
    """
    API View to list all departments or create a new department.
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTCookieAuthentication]

    def list(self, request, *args, **kwargs):
        """
        Override the default list method to customize the response if needed.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": "success",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """
        Override the default create method to handle validation errors or custom responses.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                "status": "success",
                "message": "Department created successfully.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class DepartmentDetailView(RetrieveUpdateDestroyAPIView):
    """
    API View to retrieve, update or delete a department.
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def retrieve(self, request, *args, **kwargs):
        """
        Override the default retrieve method to customize the response.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "status": "success",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        """
        Override the default update method to handle validation errors or custom responses.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({
                "status": "success",
                "message": "Department updated successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """
        Override the default destroy method to customize the response.
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "status": "success",
            "message": "Department deleted successfully."
        }, status=status.HTTP_200_OK)

class DepartmentCoursesView(APIView):
    """
    API View to get courses for the current user's department.
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTCookieAuthentication]
    
    def get(self, request, *args, **kwargs):
        """
        Get all courses related to the current user's department.
        """
        # Get the current user
        user = request.user
        
        # Determine the user's department
        department_id = None
        
        if user.user_type == 'teacher':
            try:
                teacher = Teacher.objects.get(teacher_id=user)
                if teacher.dept_id:
                    department_id = teacher.dept_id.id
            except Teacher.DoesNotExist:
                pass
        elif user.user_type == 'student':
            try:
                student = Student.objects.get(student_id=user)
                if student.dept_id:
                    department_id = student.dept_id.id
            except Student.DoesNotExist:
                pass
        
        if not department_id:
            return Response({
                "status": "error",
                "message": "User has no associated department."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get courses owned by this department
        owned_courses = Course.objects.filter(course_id__course_dept_id=department_id)
        
        # Get courses being taught by this department for other departments
        teaching_courses = Course.objects.filter(teaching_dept_id=department_id).exclude(course_id__course_dept_id=department_id)
        
        # Get courses owned by this department but taught by other departments
        receiving_courses = Course.objects.filter(
            course_id__course_dept_id=department_id,
            teaching_dept_id__isnull=False
        ).exclude(teaching_dept_id=department_id)
        
        # Serialize the data
        owned_courses_serializer = CourseSerializer(owned_courses, many=True)
        teaching_courses_serializer = CourseSerializer(teaching_courses, many=True)
        receiving_courses_serializer = CourseSerializer(receiving_courses, many=True)
        
        return Response({
            "status": "success",
            "owned_courses": owned_courses_serializer.data,
            "teaching_courses": teaching_courses_serializer.data,
            "receiving_courses": receiving_courses_serializer.data
        }, status=status.HTTP_200_OK)