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

        if TeacherCourse.objects.filter(
            teacher_id=teacher_id,
            course_id=course_id,
            semester=semester
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(
                "This teacher is already assigned to this course for the selected semester."
            )

        if teacher_id.dept_id != course_id.teaching_dept_id:
            raise serializers.ValidationError(
                "Teacher and course must belong to the same department"
            )

        return data