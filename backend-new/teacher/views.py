from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from authentication.authentication import IsAuthenticated
from .models import Teacher
from .serializers import TeacherSerializer, CreateTeacherSerializer

class AddNewTeacher(generics.CreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreateTeacherSerializer

    def post(self, request):
        try:
            is_hod = Teacher.objects.filter(
                teacher=request.user,
                teacher_role='HOD'
            ).exists()
            
            if not is_hod:
                return Response(
                    {
                        'detail': "Only HOD can add new teachers.",
                        "code": "permission_denied"
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            return Response(
                {
                    'detail': "Teacher added successfully.",
                    'data': serializer.data
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

class TeacherListView(generics.ListAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeacherSerializer

    def get_queryset(self):
        user = self.request.user
        
        try:
            hod_dept = Teacher.objects.get(
                teacher=user,
                teacher_role='HOD'
            ).dept
            return Teacher.objects.filter(dept=hod_dept)
        except Teacher.DoesNotExist:
            return Teacher.objects.filter(teacher=user)

class TeacherDetailView(generics.RetrieveUpdateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeacherSerializer
    queryset = Teacher.objects.all()
    lookup_field = 'id'

    def get_object(self):
        teacher_id = self.kwargs.get('id')
        teacher = get_object_or_404(Teacher, id=teacher_id)
        
        user = self.request.user
        is_hod = Teacher.objects.filter(
            teacher=user,
            teacher_role='HOD',
            dept=teacher.dept
        ).exists()
        
        if not is_hod and teacher.teacher != user:
            self.permission_denied(
                self.request,
                message="You don't have permission to access this teacher's details."
            )
        
        return teacher

    def patch(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            return Response(
                {
                    'detail': "Teacher updated successfully.",
                    'data': serializer.data
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