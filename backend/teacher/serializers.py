from rest_framework import serializers
from .models import Teacher
from authentication.serializers import UserSerializer
from department.serializers import DepartmentSerializer

class TeacherSerializer(serializers.ModelSerializer):
    teacher_id = UserSerializer(read_only=True)
    dept_id = DepartmentSerializer(read_only=True)
    
    class Meta:
        model = Teacher
        fields = [
            'id', 
            'teacher_id', 
            'dept_id', 
            'staff_code', 
            'teacher_role', 
            'teacher_specialisation', 
            'teacher_working_hours'
        ]
        read_only_fields = ['id']

class UpdateTeacherSerializer(serializers.ModelSerializer):
    dept_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher._meta.get_field('dept_id').related_model.objects.all(),
        allow_null=True,
        required=False
    )
    
    class Meta:
        model = Teacher
        fields = [
            'dept_id',
            'staff_code',
            'teacher_role',
            'teacher_specialisation',
            'teacher_working_hours'
        ]
        
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class CreateTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = [
            'teacher_id',
            'dept_id',
            'staff_code',
            'teacher_role',
            'teacher_specialisation',
            'teacher_working_hours'
        ]
    
    def validate(self, data):
        # Add any additional validation here
        return data