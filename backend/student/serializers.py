from rest_framework import serializers
from .models import Student
from authentication.serializers import UserSerializer

class StudentSerializer(serializers.ModelSerializer):
    student_detail = UserSerializer(source='student', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id',
            'student',
            'student_detail',
            'batch',
            'current_semester'
        ]
        extra_kwargs = {
            'student': {'write_only': True}
        }

    def validate(self, data):
        student_user = data.get('student', self.instance.student if self.instance else None)
        batch = data.get('batch', self.instance.batch if self.instance else None)

        if student_user and (not hasattr(student_user, 'user_type') or student_user.user_type != 'student'):
            raise serializers.ValidationError(
                {"student": "Associated user must be of type 'student'"}
            )

        if Student.objects.filter(
            student=student_user,
            batch=batch
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(
                {"batch": "This student already exists in the specified batch"}
            )

        current_semester = data.get('current_semester', self.instance.current_semester if self.instance else None)
        if current_semester and (current_semester < 1 or current_semester > 10):
            raise serializers.ValidationError(
                {"current_semester": "Semester must be between 1 and 10"}
            )

        return data

    def create(self, validated_data):
        return Student.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.batch = validated_data.get('batch', instance.batch)
        instance.current_semester = validated_data.get('current_semester', instance.current_semester)
        instance.save()
        return instance