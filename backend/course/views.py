from rest_framework import generics, permissions, status
from rest_framework.response import Response
from authentication.authentication import IsAuthenticated
from .models import Course
from .serializers import CourseSerializer
from department.models import Department

class CourseListCreateView(generics.ListCreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseSerializer

    def get_queryset(self):
        user = self.request.user
        try:
            print("Uawe", user)
            hod_dept = Department.objects.get(hod=user)
            print("HOD Dept", hod_dept)
            return Course.objects.filter(department=hod_dept)
        except Department.DoesNotExist:
            return Course.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        try:
            hod_dept = Department.objects.get(hod=user)
            serializer.save(department=hod_dept)
        except Department.DoesNotExist:
            raise self.serializers.ValidationError(
                {"detail": "Only HOD can create courses for their department."}
            )

class CourseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        
        try:
            hod_dept = Department.objects.get(hod=user)
            return Course.objects.filter(department=hod_dept)
        except Department.DoesNotExist:
            return Course.objects.none()

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(
                {"detail": "Course deleted successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )