from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from authentication.authentication import IsAuthenticated
from .models import Course, CourseResourceAllocation, CourseRoomPreference, TeacherCourseAssignment
from .serializers import CourseSerializer, CreateCourseSerializer, UpdateCourseSerializer, CourseResourceAllocationSerializer, CourseRoomPreferenceSerializer
from department.models import Department
from django.db import models
from rest_framework.views import APIView

class AddNewCourse(generics.CreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreateCourseSerializer

    def post(self, request):
        try:
            is_hod = Department.objects.filter(hod_id=request.user).exists()
            
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
            
            response_serializer = CourseSerializer(course, context={'request': request})
            
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
            hod_dept = Department.objects.get(hod_id=user)
            return Course.objects.filter(course_id__course_dept_id=hod_dept)
        except Department.DoesNotExist:
            return Course.objects.none()
    
    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        context = super().get_serializer_context()
        return context

    def post(self, request, *args, **kwargs):
        try:
            is_hod = Department.objects.filter(hod_id=request.user).exists()
            
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
            
            response_serializer = CourseSerializer(course, context={'request': request})
            
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
    serializer_class = CourseSerializer
    lookup_field = 'id'
    
    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return UpdateCourseSerializer
        return CourseSerializer

    def get_object(self):
        course_id = self.kwargs.get('id')
        # Use select_related to fetch related departments and course master in a single query
        # This automatically loads:
        # - course_id (CourseMaster)
        # - course_id__course_dept_id (Department)  
        # - for_dept_id (Department)
        # - teaching_dept_id (Department)
        course = get_object_or_404(
            Course.objects.select_related(
                'course_id', 
                'course_id__course_dept_id',
                'for_dept_id', 
                'teaching_dept_id'
            ), 
            id=course_id
        )
        
        # Check if user has permission to edit/delete this course
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            user = self.request.user
            
            # Get user's department (if HOD)
            user_dept = None
            try:
                user_dept = Department.objects.get(hod_id=user)
            except Department.DoesNotExist:
                pass
            
            if user_dept:
                # Owner department - full rights (edit and delete)
                is_owner = user_dept.id == course.course_id.course_dept_id.id
                
                # Teaching department - limited edit rights, no delete
                is_teacher = user_dept.id == course.teaching_dept_id.id if course.teaching_dept_id else False
                
                # For department - no edit or delete rights
                is_learner = user_dept.id == course.for_dept_id.id if course.for_dept_id else False
                
                # If DELETE, only owner can delete
                if self.request.method == 'DELETE' and not is_owner:
                    self.permission_denied(
                        self.request,
                        message="Only the owner department's HOD can delete this course."
                    )
                
                # If EDIT (PUT/PATCH), only owner or teacher can edit
                if self.request.method in ['PUT', 'PATCH'] and not (is_owner or is_teacher):
                    self.permission_denied(
                        self.request,
                        message="Only the owner or teaching department's HOD can edit this course."
                    )
            else:
                # Not an HOD of any department
                self.permission_denied(
                    self.request,
                    message="You don't have permission to modify this course."
                )
    
        return course
        
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            
            # Get relationship type for the user's perspective
            user_dept = None
            try:
                user_dept = Department.objects.get(hod_id=request.user)
            except Department.DoesNotExist:
                pass
            
            response_data = serializer.data
            if user_dept:
                # Add user's relationship to this course
                owning_dept_id = instance.course_id.course_dept_id.id if instance.course_id and instance.course_id.course_dept_id else None
                for_dept_id = instance.for_dept_id.id if instance.for_dept_id else None
                teaching_dept_id = instance.teaching_dept_id.id if instance.teaching_dept_id else None
                
                user_roles = []
                if user_dept.id == owning_dept_id:
                    user_roles.append("owner")
                if user_dept.id == for_dept_id:
                    user_roles.append("learner")
                if user_dept.id == teaching_dept_id:
                    user_roles.append("teacher")
                
                response_data['user_department_roles'] = user_roles
            
            return Response(
                {
                    'status': 'success',
                    'data': response_data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print(e)
            return Response(
                {
                    'status': 'error',
                    'detail': "Something went wrong!",
                    "code": "internal_error"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            user_dept = None
            try:
                user_dept = Department.objects.get(hod_id=request.user)
            except Department.DoesNotExist:
                pass
            
            # Restrict what teaching departments can edit
            if user_dept and user_dept.id == instance.teaching_dept_id.id and user_dept.id != instance.course_id.course_dept_id.id:
                # Teaching department can only edit certain fields
                allowed_fields = ['teaching_status', 'no_of_students']
                for field in list(request.data.keys()):
                    if field not in allowed_fields:
                        request.data.pop(field, None)
            
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

class CourseResourceAllocationListCreateView(generics.ListCreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseResourceAllocationSerializer

    def get_queryset(self):
        user = self.request.user
        try:
            user_dept = Department.objects.get(hod_id=user)
            # Return allocations where the user's department is either the original or the teaching department
            return CourseResourceAllocation.objects.filter(
                models.Q(original_dept_id=user_dept) | 
                models.Q(teaching_dept_id=user_dept)
            ).select_related('course_id', 'original_dept_id', 'teaching_dept_id')
        except Department.DoesNotExist:
            return CourseResourceAllocation.objects.none()
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get the user's department
        user_dept = None
        try:
            user_dept = Department.objects.get(hod_id=request.user)
        except Department.DoesNotExist:
            return Response(
                {
                    'status': 'error',
                    'detail': 'User is not a HOD of any department'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Separate incoming and outgoing allocations
        incoming_allocations = queryset.filter(
            teaching_dept_id=user_dept
        ).exclude(
            original_dept_id=user_dept
        )
        
        outgoing_allocations = queryset.filter(
            original_dept_id=user_dept
        )
        
        # Serialize both sets of allocations
        incoming_serializer = self.get_serializer(incoming_allocations, many=True)
        outgoing_serializer = self.get_serializer(outgoing_allocations, many=True)
        
        return Response(
            {
                'status': 'success',
                'user_department_id': user_dept.id,
                'user_department_name': user_dept.dept_name,
                'incoming_allocations': incoming_serializer.data,
                'outgoing_allocations': outgoing_serializer.data
            },
            status=status.HTTP_200_OK
        )

    def post(self, request, *args, **kwargs):
        try:
            # Check if user is an HOD
            user_dept = None
            try:
                user_dept = Department.objects.get(hod_id=request.user)
            except Department.DoesNotExist:
                return Response(
                    {
                        'detail': "Only department HODs can request resource allocation.",
                        "code": "permission_denied"
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get the course
            course_id = request.data.get('course_id')
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return Response(
                    {
                        'detail': "Course not found.",
                        "code": "not_found"
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Verify the requester is from the course's owning department
            if course.course_id.course_dept_id.id != user_dept.id:
                return Response(
                    {
                        'detail': "Only the course owner department can request allocation.",
                        "code": "permission_denied"
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Check if there's already a pending or approved allocation for this course with the same teaching department
            teaching_dept_id = request.data.get('teaching_dept_id')
            existing_allocation = CourseResourceAllocation.objects.filter(
                course_id=course_id,
                teaching_dept_id=teaching_dept_id,
                status__in=['pending', 'approved']
            ).exists()
            
            if existing_allocation:
                return Response(
                    {
                        'detail': "A resource allocation request already exists for this course with the selected teaching department.",
                        "code": "duplicate_request"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Check if the course is already taught by the requested department
            if course.teaching_dept_id and course.teaching_dept_id.id == int(teaching_dept_id):
                return Response(
                    {
                        'detail': "This department is already teaching this course.",
                        "code": "already_teaching"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the allocation request
            data = {
                'course_id': course_id,
                'original_dept_id': user_dept.id,
                'teaching_dept_id': teaching_dept_id,
                'allocation_reason': request.data.get('allocation_reason', ''),
                'status': 'pending'
            }
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            allocation = serializer.save()
            
            return Response(
                {
                    'detail': "Resource allocation request created successfully.",
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

class CourseResourceAllocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseResourceAllocationSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        return CourseResourceAllocation.objects.all()
    
    def get_object(self):
        allocation_id = self.kwargs.get('id')
        allocation = get_object_or_404(
            CourseResourceAllocation.objects.select_related(
                'course_id', 
                'original_dept_id', 
                'teaching_dept_id'
            ), 
            id=allocation_id
        )
        
        # Check permissions
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            user = self.request.user
            user_dept = None
            try:
                user_dept = Department.objects.get(hod_id=user)
            except Department.DoesNotExist:
                self.permission_denied(
                    self.request,
                    message="You don't have permission to modify this allocation."
                )
            
            if user_dept:
                # Original dept can update or delete the request while it's pending
                is_original_dept = user_dept.id == allocation.original_dept_id.id
                
                # Teaching dept can only respond to the request (approve/reject)
                is_teaching_dept = user_dept.id == allocation.teaching_dept_id.id
                
                # If DELETE, only original dept can delete pending requests
                if self.request.method == 'DELETE':
                    if not is_original_dept or allocation.status != 'pending':
                        self.permission_denied(
                            self.request,
                            message="Only the original department's HOD can delete pending allocation requests."
                        )
                
                # For PATCH, check who's making the request
                if self.request.method == 'PATCH':
                    # Original dept can update anything while pending
                    if is_original_dept and allocation.status != 'pending':
                        self.permission_denied(
                            self.request,
                            message="Original department can only modify pending requests."
                        )
                    
                    # Teaching dept can only update status
                    if is_teaching_dept:
                        # Check that we're only updating status
                        if set(self.request.data.keys()) - {'status'}:
                            self.permission_denied(
                                self.request,
                                message="Teaching department can only update the status field."
                            )
                    
                    # Neither original nor teaching dept
                    if not (is_original_dept or is_teaching_dept):
                        self.permission_denied(
                            self.request,
                            message="You don't have permission to update this allocation."
                        )
            else:
                self.permission_denied(
                    self.request,
                    message="You don't have permission to modify this allocation."
                )
        
        return allocation
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(
                {
                    'status': 'success',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print(e)
            return Response(
                {
                    'status': 'error',
                    'detail': "Something went wrong!",
                    'code': 'internal_error'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request, *args, **kwargs):
        try:
            allocation = self.get_object()
            
            # Get user department
            user_dept = Department.objects.get(hod_id=request.user)
            
            # If teaching department is updating status
            if user_dept.id == allocation.teaching_dept_id.id and 'status' in request.data:
                status_value = request.data.get('status')
                
                # If approving the request, also update the course's teaching_dept_id
                if status_value == 'approved':
                    course = allocation.course_id
                    course.teaching_dept_id = allocation.teaching_dept_id
                    course.save()
            
            # Update the allocation
            serializer = self.get_serializer(allocation, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            updated_allocation = serializer.save()
            
            return Response(
                {
                    'status': 'success',
                    'detail': "Resource allocation updated successfully.",
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print(e)
            return Response(
                {
                    'status': 'error',
                    'detail': "Something went wrong!",
                    'code': 'internal_error'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(
                {
                    'status': 'success',
                    'detail': 'Resource allocation request deleted successfully.'
                },
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            print(e)
            return Response(
                {
                    'status': 'error',
                    'detail': "Something went wrong!",
                    'code': 'internal_error'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CourseRoomPreferenceListCreateView(generics.ListCreateAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseRoomPreferenceSerializer

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return CourseRoomPreference.objects.filter(course_id=course_id)
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(
                {
                    'detail': "Something went wrong!",
                    "code": "internal_error"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        course = get_object_or_404(Course, id=course_id)
        serializer.save(course_id=course)
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(
                {
                    'detail': "Room preference added successfully.",
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

class CourseRoomPreferenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CourseRoomPreferenceSerializer
    
    def get_object(self):
        preference_id = self.kwargs.get('id')
        course_id = self.kwargs.get('course_id')
        preference = get_object_or_404(
            CourseRoomPreference,
            id=preference_id,
            course_id=course_id
        )
        return preference
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(
                {
                    'detail': "Something went wrong!",
                    "code": "internal_error"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            return Response(
                {
                    'detail': "Room preference updated successfully.",
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
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(
                {
                    'detail': "Room preference deleted successfully."
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

class CourseAssignmentStatsView(APIView):
    authentication_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id=None):
        try:
            if course_id:
                # Get stats for a specific course
                course = Course.objects.get(id=course_id)
                assignments = TeacherCourseAssignment.objects.filter(course=course)
                stats = {
                    'course_id': course.id,
                    'course_name': course.course_detail.course_name,
                    'course_code': course.course_detail.course_id,
                    'total_teachers': assignments.count(),
                    'teachers': [
                        {
                            'teacher_id': assignment.teacher.id,
                            'teacher_name': f"{assignment.teacher.teacher_id.first_name} {assignment.teacher.teacher_id.last_name}",
                            'semester': assignment.semester,
                            'academic_year': assignment.academic_year,
                            'student_count': assignment.student_count
                        }
                        for assignment in assignments
                    ]
                }
            else:
                # Get stats for all courses
                courses = Course.objects.all()
                stats = []
                for course in courses:
                    assignments = TeacherCourseAssignment.objects.filter(course=course)
                    stats.append({
                        'course_id': course.id,
                        'course_name': course.course_detail.course_name,
                        'course_code': course.course_detail.course_id,
                        'total_teachers': assignments.count(),
                        'teachers': [
                            {
                                'teacher_id': assignment.teacher.id,
                                'teacher_name': f"{assignment.teacher.teacher_id.first_name} {assignment.teacher.teacher_id.last_name}",
                                'semester': assignment.semester,
                                'academic_year': assignment.academic_year,
                                'student_count': assignment.student_count
                            }
                            for assignment in assignments
                        ]
                    })
            return Response(stats)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)