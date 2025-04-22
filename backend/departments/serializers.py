from rest_framework import serializers
from .models import Department, Teacher

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('id', 'dept_name', 'hod', 'established_date', 'contact_info')

class TeacherSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.IntegerField(write_only=True)
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = ('id', 'user', 'user_details', 'staff_code', 'department', 
                 'department_id', 'role', 'specialization', 'working_hours')

    def get_user_details(self, obj):
        return {
            'username': obj.user.username,
            'name': obj.user.name,
            'email': obj.user.email
        } 