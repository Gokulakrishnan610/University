# serializers.py
from rest_framework import serializers
from .models import Student
from authentication.serializers import UserSerializer
from department.serializers import DepartmentSerializer

class StudentSerializer(serializers.ModelSerializer):
    student_detail = UserSerializer(source='student_id', read_only=True)
    dept_detail = DepartmentSerializer(source='dept_id', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id',
            'student_id',
            'student_detail',
            'batch',
            'current_semester',
            'year',
            'dept_id',
            'dept_detail',
            'roll_no',
            'student_type',
            'degree_type'
        ]
        extra_kwargs = {
            'student_id': {'write_only': True}
        }

    def validate(self, data):
        instance = self.instance

        student_user = data.get('student_id', getattr(instance, 'student_id', None))
        batch = data.get('batch', getattr(instance, 'batch', None))
        current_semester = data.get('current_semester', getattr(instance, 'current_semester', None))

        if student_user and student_user.user_type != 'student':
            raise serializers.ValidationError({"student_id": "Associated user must be of type 'student'"})

        if Student.objects.filter(student_id=student_user, batch=batch).exclude(pk=getattr(instance, 'pk', None)).exists():
            raise serializers.ValidationError({"batch": "This student already exists in the specified batch"})

        if current_semester is not None and (current_semester < 1 or current_semester > 10):
            raise serializers.ValidationError({"current_semester": "Semester must be between 1 and 10"})

        return data

    def create(self, validated_data):
        return Student.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
