from django.shortcuts import render
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from authentication.authentication import IsAuthenticated
from .models import TeacherCourse
from .serializers import TeacherCourseSerializer
from department.models import Department
from django.core.exceptions import ValidationError
from teacher.models import Teacher

# Create your views here.
class TeacherCourseListCreateView(generics.ListCreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeacherCourseSerializer

    def get_queryset(self):
        user = self.request.user
        
        # Admin users can see all assignments
        if user.is_superuser or user.is_staff:
            return TeacherCourse.objects.all()
            
        try:
            teacher = Teacher.objects.get(teacher_id=user)
            
            # If user is HOD, return all department assignments
            if teacher.teacher_role == 'HOD' and teacher.dept_id:
                return TeacherCourse.objects.filter(
                    teacher_id__dept_id=teacher.dept_id,
                    course_id__teaching_dept_id=teacher.dept_id
                )
            # For regular teachers, only show their own assignments
            else:
                return TeacherCourse.objects.filter(teacher_id=teacher)
        except Teacher.DoesNotExist:
            return TeacherCourse.objects.none()

    def perform_create(self, serializer):
        user = self.request.user    
        
        # Admin users can create assignments for any department
        if user.is_superuser or user.is_staff:
            try:
                serializer.save()
                return
            except ValidationError as e:
                raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        
        # For non-admin users, follow existing HOD-based permissions
        try:
            teacher = Teacher.objects.get(teacher_id=user)
            
            teacher_to_assign = serializer.validated_data['teacher_id']
            course = serializer.validated_data['course_id']
            
            if teacher.teacher_role != 'HOD':
                raise serializers.ValidationError(
                    {"detail": "Only HOD or admin can create teacher course assignments."}
                )
            
            # HOD can only assign teachers and courses from their own department
            if teacher_to_assign.dept_id != teacher.dept_id or course.teaching_dept_id != teacher.dept_id:
                raise serializers.ValidationError(
                    "You can only assign teachers and courses from your own department"
                )
                
            try:
                serializer.save()
            except ValidationError as e:
                raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        except Teacher.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "Teacher profile not found. Cannot create assignments."}
            )

class TeacherCourseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeacherCourseSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        
        # Admin users can see all assignments
        if user.is_superuser or user.is_staff:
            return TeacherCourse.objects.all()
        
        try:
            teacher = Teacher.objects.get(teacher_id=user)
            
            # If user is HOD, return all department assignments
            if teacher.teacher_role == 'HOD' and teacher.dept_id:
                return TeacherCourse.objects.filter(
                    teacher_id__dept_id=teacher.dept_id,
                    course_id__teaching_dept_id=teacher.dept_id
                )
            # For regular teachers, only show their own assignments
            else:
                return TeacherCourse.objects.filter(teacher_id=teacher)
        except Teacher.DoesNotExist:
            return TeacherCourse.objects.none()

    def perform_update(self, serializer):
        user = self.request.user
        
        # Admin users can update any assignment
        if user.is_superuser or user.is_staff:
            serializer.save()
            return
            
        try:
            teacher = Teacher.objects.get(teacher_id=user)
            
            # Only HOD can update assignments
            if teacher.teacher_role != 'HOD':
                raise serializers.ValidationError(
                    {"detail": "Only HOD or admin can update teacher course assignments."}
                )
            
            instance = self.get_object()
            
            if 'teacher_id' in serializer.validated_data:
                if serializer.validated_data['teacher_id'].dept_id != teacher.dept_id:
                    raise serializers.ValidationError(
                        {"teacher_id": "You can only assign teachers from your department."}
                    )
            
            if 'course_id' in serializer.validated_data:
                if serializer.validated_data['course_id'].teaching_dept_id != teacher.dept_id:
                    raise serializers.ValidationError(
                        {"course_id": "You can only assign courses from your department."}
                    )
            
            serializer.save()
        except Teacher.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "Teacher profile not found. Cannot update assignments."}
            )
            
    def perform_destroy(self, instance):
        user = self.request.user
        
        # Admin users can delete any assignment
        if user.is_superuser or user.is_staff:
            instance.delete()
            return
            
        try:
            teacher = Teacher.objects.get(teacher_id=user)
            
            # Only HOD can delete assignments
            if teacher.teacher_role != 'HOD':
                raise serializers.ValidationError(
                    {"detail": "Only HOD or admin can delete teacher course assignments."}
                )
                
            instance.delete()
        except Teacher.DoesNotExist:
            raise serializers.ValidationError(
                {"detail": "Teacher profile not found. Cannot delete assignments."}
            )