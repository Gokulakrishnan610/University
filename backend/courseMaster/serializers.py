# serializers.py
from rest_framework import serializers
from .models import CourseMaster
from department.serializers import DepartmentSerializer

class CourseMasterSerializer(serializers.ModelSerializer):
    course_dept = DepartmentSerializer(read_only=True)
    
    class Meta:
        model = CourseMaster
        fields = ['course_id', 'course_name', 'course_dept']