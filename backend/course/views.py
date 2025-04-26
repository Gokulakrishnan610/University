from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from authentication.authentication import IsAuthenticated
from .models import Course
from .serializers import CourseSerializer, CreateCourseSerializer, UpdateCourseSerializer
from department.models import Department

class AddNewCourse(generics.CreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreateCourseSerializer

    def post(self, request):
        try:
            is_hod = Department.objects.filter(hod=request.user).exists()
            
            if not is_hod:
                return Response(
                    {
                        'detail': "Only HOD can add new courses.",
                        "code": "permission_denied"
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            course = serializer.save()
            
            response_serializer = CourseSerializer(course)
            
            return Response(
                {
                    'detail': "Course added successfully.",
                    'data': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            print(e)
            return Response(
                {
                    'detail': "Something went wrong!",
                    "code": "internal_error"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CourseListView(generics.ListCreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseSerializer

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateCourseSerializer
        return CourseSerializer

    def get_queryset(self):
        user = self.request.user
        try:
            hod_dept = Department.objects.get(hod=user)
            return Course.objects.filter(course__course_dept=hod_dept)
        except Department.DoesNotExist:
            return Course.objects.none()

    def post(self, request, *args, **kwargs):
        try:
            is_hod = Department.objects.filter(hod=request.user).exists()
            
            if not is_hod:
                return Response(
                    {
                        'detail': "Only HOD can add new courses.",
                        "code": "permission_denied"
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            course = serializer.save()
            
            response_serializer = CourseSerializer(course)
            
            return Response(
                {
                    'detail': "Course added successfully.",
                    'data': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            print(e)
            return Response(
                {
                    'detail': "Something went wrong!",
                    "code": "internal_error"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()
    lookup_field = 'id'
    
    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return UpdateCourseSerializer
        return CourseSerializer

    def get_object(self):
        course_id = self.kwargs.get('id')
        course = get_object_or_404(Course, id=course_id)
        
        user = self.request.user
        is_hod = Department.objects.filter(
            hod=user,
            id=course.department.id
        ).exists()
        
        if not is_hod:
            self.permission_denied(
                self.request,
                message="You don't have permission to access this course."
            )
        
        return course

    def patch(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            updated_course = serializer.save()
            
            response_serializer = CourseSerializer(updated_course)
            
            return Response(
                {
                    'detail': "Course updated successfully.",
                    'data': response_serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print(e)
            return Response(
                {
                    'detail': "Something went wrong!",
                    "code": "internal_error"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(
                {
                    'detail': "Course deleted successfully."
                },
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            print(e)
            return Response(
                {
                    'detail': "Something went wrong!",
                    "code": "internal_error"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )