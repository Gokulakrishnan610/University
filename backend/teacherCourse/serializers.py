from rest_framework import serializers
from .models import TeacherCourse
from teacher.serializers import TeacherSerializer
from course.serializers import CourseSerializer

class TeacherCourseSerializer(serializers.ModelSerializer):
    teacher_detail = TeacherSerializer(source='teacher_id', read_only=True)
    course_detail = CourseSerializer(source='course_id', read_only=True)

    class Meta:
        model = TeacherCourse
        fields = [
            'id',
            'teacher_id',
            'teacher_detail',
            'course_id',
            'course_detail',
            'student_count',
            'academic_year',
            'semester'
        ]
        extra_kwargs = {
            'teacher_id': {'write_only': True},
            'course_id': {'write_only': True}
        }

    def validate(self, data):
        teacher_id = data.get('teacher_id', self.instance.teacher_id if self.instance else None)
        course_id = data.get('course_id', self.instance.course_id if self.instance else None)
        semester = data.get('semester', self.instance.semester if self.instance else None)

        if not teacher_id or not course_id:
            raise serializers.ValidationError(
                "Both teacher and course are required."
            )

        # Check if teacher has a department assigned
        if not teacher_id.dept_id:
            raise serializers.ValidationError(
                "Teacher must be assigned to a department before being assigned to a course."
            )

        # Check for existing assignments regardless of semester
        if TeacherCourse.objects.filter(
            teacher_id=teacher_id,
            course_id=course_id
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(
                "This teacher is already assigned to this course. A teacher cannot be assigned to the same course multiple times."
            )

        # Check if teacher and course departments match
        if teacher_id.dept_id.id != course_id.teaching_dept_id_id:
            teacher_dept = teacher_id.dept_id.dept_name
            course_dept = course_id.teaching_dept_id.dept_name if course_id.teaching_dept_id else "No Department"
            raise serializers.ValidationError(
                f"Teacher and course must belong to the same department. Teacher's department: {teacher_dept}, Course's teaching department: {course_dept}"
            )

        # Check teacher's working hours
        assigned_courses = TeacherCourse.objects.filter(teacher_id=teacher_id)
        total_hours_assigned = sum(course.course_id.credits for course in assigned_courses if course.course_id)
        
        if total_hours_assigned + course_id.credits > teacher_id.teacher_working_hours:
            raise serializers.ValidationError(
                f"Teacher working hour limit exceeded. Current total: {total_hours_assigned}, New course credits: {course_id.credits}, Limit: {teacher_id.teacher_working_hours}"
            )

        return data