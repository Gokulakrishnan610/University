from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from authentication.authentication import IsAuthenticated
from .models import TeacherCourse
from .serializers import TeacherCourseSerializer
from department.models import Department
from django.core.exceptions import ValidationError

# Create your views here.
class TeacherCourseListCreateView(generics.ListCreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeacherCourseSerializer

    def get_queryset(self):
        user = self.request.user
        
        try:
            hod_dept = Department.objects.get(hod_id=user)
            return TeacherCourse.objects.filter(
                teacher_id__dept_id=hod_dept,
                course_id__teaching_dept_id=hod_dept
            )
        except Department.DoesNotExist:
            return TeacherCourse.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        try:
            hod_dept = Department.objects.get(hod_id=user)
            teacher = serializer.validated_data['teacher_id']
            course = serializer.validated_data['course_id']
            
            if teacher.dept_id != hod_dept or course.teaching_dept_id != hod_dept:
                raise serializer.ValidationError(
                    "You can only assign teachers and courses from your own department"
                )
                
            try:
                serializer.save()
            except ValidationError as e:
                raise serializer.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        except Department.DoesNotExist:
            raise serializer.ValidationError(
                {"detail": "Only HOD can create teacher course assignments."}
            )

class TeacherCourseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeacherCourseSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        
        try:
            hod_dept = Department.objects.get(hod_id=user)
            return TeacherCourse.objects.filter(
                teacher_id__dept_id=hod_dept,
                course_id__teaching_dept_id=hod_dept
            )
        except Department.DoesNotExist:
            return TeacherCourse.objects.none()

    def perform_update(self, serializer):
        user = self.request.user
        try:
            hod_dept = Department.objects.get(hod_id=user)
            instance = self.get_object()
            
            if 'teacher_id' in serializer.validated_data:
                if serializer.validated_data['teacher_id'].dept_id != hod_dept:
                    raise serializers.ValidationError(
                        {"teacher_id": "You can only assign teachers from your department. Bro do u remember the dept u r from?"}
                    )
            
            if 'course_id' in serializer.validated_data:
                if serializer.validated_data['course_id'].teaching_dept_id != hod_dept:
                    raise serializers.ValidationError(
                        {"course_id": "You can only assign courses from your department. WTF u r doing bro"}
                    )
            
            serializer.save()
        except Department.DoesNotExist:
            raise serializer.ValidationError(
                {"detail": "Only HOD can update teacher course assignments. Who are u?"}
            )