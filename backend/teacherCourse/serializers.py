from rest_framework import serializers
from .models import TeacherCourse
from teacher.serializers import TeacherSerializer
from course.serializers import CourseSerializer

class TeacherCourseSerializer(serializers.ModelSerializer):
    teacher_detail = TeacherSerializer(source='teacher', read_only=True)
    course_detail = CourseSerializer(source='course', read_only=True)

    class Meta:
        model = TeacherCourse
        fields = [
            'id',
            'teacher',
            'teacher_detail',
            'course',
            'course_detail',
            'student_count',
            'academic_year',
            'semester'
        ]
        extra_kwargs = {
            'teacher': {'write_only': True},
            'course': {'write_only': True}
        }

    def validate(self, data):
        teacher = data.get('teacher', self.instance.teacher if self.instance else None)
        course = data.get('course', self.instance.course if self.instance else None)
        semester = data.get('semester', self.instance.semester if self.instance else None)

        if TeacherCourse.objects.filter(
            teacher=teacher,
            course=course,
            semester=semester
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(
                "This teacher is already assigned to this course for the selected semester."
            )

        if teacher.dept != course.department:
            raise serializers.ValidationError(
                "Teacher and course must belong to the same department"
            )

        return data