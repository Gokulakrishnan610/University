from rest_framework import serializers
from .models import StudentCourse
from student.serializers import StudentSerializer
from course.serializers import CourseSerializer

class StudentCourseSerializer(serializers.ModelSerializer):
    student_detail = StudentSerializer(source='student_id', read_only=True)
    course_detail = CourseSerializer(source='course_id', read_only=True)

    class Meta:
        model = StudentCourse
        fields = [
            'id',
            'student_id',
            'student_detail',
            'course_id',
            'course_detail',
        ]
        extra_kwargs = {
            'student_id': {'write_only': True},
            'course_id': {'write_only': True}
        }

    def validate(self, data):
        student_id = data.get('student_id', self.instance.student_id if self.instance else None)
        course_id = data.get('course_id', self.instance.course_id if self.instance else None)

        if StudentCourse.objects.filter(
            student_id=student_id,
            course_id=course_id
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(
                "This student is already enrolled in this course."
            )
        return data