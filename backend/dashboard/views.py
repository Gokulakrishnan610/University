from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from course.models import Course, CourseRoomPreference
from teacher.models import Teacher
from student.models import Student
from teacherCourse.models import TeacherCourse

# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])  # Allow any request for now, can be changed to IsAuthenticated later
def dashboard_stats(request):
    """
    Get statistics for the dashboard
    """
    # Count total courses, teachers, and students
    total_courses = Course.objects.count()
    total_teachers = Teacher.objects.count()
    total_students = Student.objects.count()
    
    # Count courses with teacher assignments
    courses_with_teachers = TeacherCourse.objects.values('course_id').distinct().count()
    
    # Count courses with room preferences
    courses_with_rooms = CourseRoomPreference.objects.values('course_id').distinct().count()
    
    # Calculate pending assignments (courses without teachers)
    pending_assignments = total_courses - courses_with_teachers
    
    return JsonResponse({
        'total_courses': total_courses,
        'total_teachers': total_teachers,
        'total_students': total_students,
        'courses_with_teachers': courses_with_teachers,
        'courses_with_rooms': courses_with_rooms,
        'pending_assignments': pending_assignments
    })
