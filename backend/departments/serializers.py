from rest_framework import serializers
from .models import Department, Teacher

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('id', 'name', 'code', 'created_at', 'updated_at')

class TeacherSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.IntegerField(write_only=True)
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = ('id', 'user', 'user_details', 'department', 'department_id', 'employee_id', 'created_at', 'updated_at')

    def get_user_details(self, obj):
        return {
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name
        } 