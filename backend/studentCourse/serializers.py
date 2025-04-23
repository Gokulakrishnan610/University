from rest_framework import serializers
from .models import StudentCourse
from student.serializers import StudentSerializer
from course.serializers import CourseSerializer

class StudentCourseSerializer(serializers.ModelSerializer):
    student_detail = StudentSerializer(source='student', read_only=True)
    course_detail = CourseSerializer(source='course', read_only=True)

    class Meta:
        model = StudentCourse
        fields = [
            'id',
            'student',
            'student_detail',
            'course',
            'course_detail',
        ]
        extra_kwargs = {
            'student': {'write_only': True},
            'course': {'write_only': True}
        }

    def validate(self, data):
        student = data.get('student', self.instance.student if self.instance else None)
        course = data.get('course', self.instance.course if self.instance else None)

        if StudentCourse.objects.filter(
            student=student,
            course=course
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(
                "This student is already enrolled in this course."
            )
        return data