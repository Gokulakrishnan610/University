from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Count, Avg, F, Q, Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from datetime import datetime, timedelta

from course.models import Course, CourseRoomPreference
from teacher.models import Teacher
from student.models import Student
from teacherCourse.models import TeacherCourse
from department.models import Department
from authentication.models import User
from studentCourse.models import StudentCourse


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Changed to require authentication
def dashboard_stats(request):
    """
    Get statistics for the dashboard filtered by user's department
    """
    # Get the logged-in user's department
    current_user = request.user
    user_dept = None
    
    # Get user's department (assuming user is related to a teacher record)
    try:
        teacher = Teacher.objects.filter(teacher_id=current_user).first()
        if teacher and teacher.dept_id:
            user_dept = teacher.dept_id
    except:
        pass
    
    # If user has a department, filter stats by that department
    if user_dept:
        # Courses for this department (either taught by or for this department)
        dept_courses = Course.objects.filter(
            for_dept_id=user_dept
        )
        total_courses = dept_courses.count()
        
        # Teachers in this department
        dept_teachers = Teacher.objects.filter(dept_id=user_dept)
        total_teachers = dept_teachers.count()
        
        # Get industry professionals count
        industry_professionals_count = dept_teachers.filter(
            Q(is_industry_professional=True) | Q(teacher_role__in=['POP', 'Industry Professional'])
        ).count()
        
        # Get HOD and senior professors count
        senior_staff_count = dept_teachers.filter(
            teacher_role__in=['HOD', 'Professor']
        ).count()
        
        # Get resigning teachers count
        resigning_teachers_count = dept_teachers.filter(
            resignation_status='resigning'
        ).count()
        
        # Students in this department's courses - improved logic
        try:
            # Get course IDs for this department
            dept_course_ids = dept_courses.values_list('id', flat=True)
            
            # Find students enrolled in these courses using StudentCourse
            student_enrollments = StudentCourse.objects.filter(
                course_id__in=dept_course_ids
            )
            student_ids = student_enrollments.values_list('student_id', flat=True).distinct()
            
            total_students = len(student_ids)
            total_enrollments = student_enrollments.count()
            
            # Calculate average enrollments per course
            avg_students_per_course = round(total_enrollments / total_courses, 1) if total_courses > 0 else 0
            
        except Exception as e:
            # Fallback method if the above fails
            total_students = 0
            total_enrollments = 0
            avg_students_per_course = 0
            print(f"Error calculating student count: {str(e)}")
        
        # Courses with teacher assignments from this department
        teacher_assignments = TeacherCourse.objects.filter(
            course_id__for_dept_id=user_dept
        )
        courses_with_teachers = teacher_assignments.values('course_id').distinct().count()
        
        # Teachers with course assignments
        teachers_with_courses = teacher_assignments.values('teacher_id').distinct().count()
        
        # Calculate teacher utilization percentage
        teacher_utilization = round((teachers_with_courses / total_teachers) * 100, 1) if total_teachers > 0 else 0
        
        # Courses with room preferences from this department
        room_preferences = CourseRoomPreference.objects.filter(
            course_id__for_dept_id=user_dept
        )
        courses_with_rooms = room_preferences.values('course_id').distinct().count()
        
        # Calculate completion percentages
        teacher_assignment_percentage = round((courses_with_teachers / total_courses) * 100, 1) if total_courses > 0 else 0
        room_assignment_percentage = round((courses_with_rooms / total_courses) * 100, 1) if total_courses > 0 else 0
        overall_completion_percentage = round((teacher_assignment_percentage + room_assignment_percentage) / 2, 1)
        
        # Calculate workload distribution
        try:
            # Average working hours per teacher
            avg_working_hours = dept_teachers.aggregate(avg=Avg('teacher_working_hours'))['avg'] or 0
            
            # Get teacher workload data
            fully_loaded_teachers = teacher_assignments.values('teacher_id').annotate(
                total_hours=Sum('course_id__course_id__credits')
            ).filter(
                total_hours__gte=F('teacher_id__teacher_working_hours')
            ).count()
            
            underutilized_teachers = total_teachers - fully_loaded_teachers
            workload_balance = round((fully_loaded_teachers / total_teachers) * 100, 1) if total_teachers > 0 else 0
            
        except Exception as e:
            avg_working_hours = 0
            fully_loaded_teachers = 0
            underutilized_teachers = 0
            workload_balance = 0
            print(f"Error calculating workload distribution: {str(e)}")
        
        # Calculate pending assignments (department courses without teachers)
        pending_assignments = total_courses - courses_with_teachers
    else:
        # If no department is found, return all stats (for admin users)
        total_courses = Course.objects.count()
        total_teachers = Teacher.objects.count()
        total_students = Student.objects.count()
        
        # All enrollments
        total_enrollments = StudentCourse.objects.count()
        avg_students_per_course = round(total_enrollments / total_courses, 1) if total_courses > 0 else 0
        
        # Teacher stats
        industry_professionals_count = Teacher.objects.filter(
            Q(is_industry_professional=True) | Q(teacher_role__in=['POP', 'Industry Professional'])
        ).count()
        
        senior_staff_count = Teacher.objects.filter(
            teacher_role__in=['HOD', 'Professor']
        ).count()
        
        resigning_teachers_count = Teacher.objects.filter(
            resignation_status='resigning'
        ).count()
        
        # Course assignments
        teacher_assignments = TeacherCourse.objects.all()
        courses_with_teachers = teacher_assignments.values('course_id').distinct().count()
        
        teachers_with_courses = teacher_assignments.values('teacher_id').distinct().count()
        teacher_utilization = round((teachers_with_courses / total_teachers) * 100, 1) if total_teachers > 0 else 0
        
        # Room preferences
        room_preferences = CourseRoomPreference.objects.all()
        courses_with_rooms = room_preferences.values('course_id').distinct().count()
        
        # Completion percentages
        teacher_assignment_percentage = round((courses_with_teachers / total_courses) * 100, 1) if total_courses > 0 else 0
        room_assignment_percentage = round((courses_with_rooms / total_courses) * 100, 1) if total_courses > 0 else 0
        overall_completion_percentage = round((teacher_assignment_percentage + room_assignment_percentage) / 2, 1)
        
        # Workload distribution
        avg_working_hours = Teacher.objects.aggregate(avg=Avg('teacher_working_hours'))['avg'] or 0
        
        # Simplified calculation for all teachers
        fully_loaded_teachers = 0  # This would require complex calculation for the admin view
        underutilized_teachers = 0
        workload_balance = 0
            
        pending_assignments = total_courses - courses_with_teachers
    
    return JsonResponse({
        # Basic counts
        'total_courses': total_courses,
        'total_teachers': total_teachers,
        'total_students': total_students,
        'courses_with_teachers': courses_with_teachers,
        'courses_with_rooms': courses_with_rooms,
        'pending_assignments': pending_assignments,
        
        # Teacher statistics
        'industry_professionals': industry_professionals_count,
        'senior_staff': senior_staff_count,
        'resigning_teachers': resigning_teachers_count,
        'teachers_with_courses': teachers_with_courses,
        'teacher_utilization': teacher_utilization,
        
        # Student statistics
        'total_enrollments': total_enrollments,
        'avg_students_per_course': avg_students_per_course,
        
        # Completion percentages
        'teacher_assignment_percentage': teacher_assignment_percentage,
        'room_assignment_percentage': room_assignment_percentage,
        'overall_completion_percentage': overall_completion_percentage,
        
        # Workload metrics
        'avg_working_hours': round(avg_working_hours, 1),
        'fully_loaded_teachers': fully_loaded_teachers,
        'underutilized_teachers': underutilized_teachers,
        'workload_balance': workload_balance,
        
        # Department info
        'is_department_filtered': bool(user_dept),
        'department_name': user_dept.dept_name if user_dept else None
    })
