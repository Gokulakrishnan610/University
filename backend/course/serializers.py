from rest_framework import serializers
from .models import Course
from department.serializers import DepartmentSerializer

class CourseSerializer(serializers.ModelSerializer):
    department_detail = DepartmentSerializer(source='department', read_only=True)
    department_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id',
            'department',
            'department_detail',
            'department_name',
            'course_code',
            'course_name',
            'course_year',
            'course_semester',
            'regulation',
            'course_type',
            'lecture_hours',
            'tutorial_hours',
            'practical_hours',
            'credits'
        ]
        extra_kwargs = {
            'department': {'write_only': True}
        }

    def get_department_name(self, obj):
        return obj.department.dept_name if obj.department else None

    def validate(self, data):
        department = data.get('department', self.instance.department if self.instance else None)
        course_code = data.get('course_code', self.instance.course_code if self.instance else None)
        course_semester = data.get('course_semester', self.instance.course_semester if self.instance else None)

        if Course.objects.filter(
            department=department,
            course_code=course_code,
            course_semester=course_semester
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(
                "A course with this code already exists in this department for the selected semester."
            )
        
        return data

class CreateCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'course_code',
            'course_name',
            'course_year',
            'course_semester',
            'regulation',
            'course_type',
            'lecture_hours',
            'tutorial_hours',
            'practical_hours',
            'credits'
        ]

    def validate(self, data):
        department = self.context.get('department')
        course_code = data.get('course_code')
        course_semester = data.get('course_semester')

        if Course.objects.filter(
            department=department,
            course_code=course_code,
            course_semester=course_semester
        ).exists():
            raise serializers.ValidationError(
                "A course with this code already exists in this department for the selected semester."
            )
        
        return data

    def create(self, validated_data):
        department = self.context.get('department')
        return Course.objects.create(department=department, **validated_data)

class UpdateCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'course_code',
            'course_name',
            'course_year',
            'course_semester',
            'regulation',
            'course_type',
            'lecture_hours',
            'tutorial_hours',
            'practical_hours',
            'credits'
        ]

    def validate(self, data):
        instance = self.instance
        department = instance.department
        course_code = data.get('course_code', instance.course_code)
        course_semester = data.get('course_semester', instance.course_semester)

        if Course.objects.filter(
            department=department,
            course_code=course_code,
            course_semester=course_semester
        ).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError(
                "A course with this code already exists in this department for the selected semester."
            )
        
        return data