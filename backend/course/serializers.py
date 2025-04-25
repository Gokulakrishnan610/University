from rest_framework import serializers
from .models import Course
from department.serializers import DepartmentSerializer
from courseMaster.serializers import CourseMasterSerializer  # Assuming you have one

class CourseSerializer(serializers.ModelSerializer):
    department_detail = DepartmentSerializer(source='course__course_dept', read_only=True)
    managed_by_detail = DepartmentSerializer(source='managed_by', read_only=True)
    course_detail = CourseMasterSerializer(source='course', read_only=True)
    department_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id',
            'course__course_dept',
            'department_detail',
            'for_dept',
            'managed_by',
            'course',
            'course_detail',
            'course_year',
            'course_semester',
            'lecture_hours',
            'tutorial_hours',
            'practical_hours',
            'credits',
            'managed_by',
            'managed_by_detail',
            'regulation',
            'course_type',
            'elective_type',
            'lab_type',
            'lab_pref',
            'no_of_students',
            'is_zero_credit_course',
            'slot_prefference'
        ]
        # extra_kwargs = {
        #     'department': {'write_only': True},
        #     'course': {'write_only': True},
        #     'managed_by': {'write_only': True}
        # }
        
    def validate(self, data):
        department = data.get('department', self.instance.department if self.instance else None)
        course = data.get('course', self.instance.course if self.instance else None)
        course_semester = data.get('course_semester', self.instance.course_semester if self.instance else None)
        managed_by = data.get('managed_by', self.instance.managed_by if self.instance else None)

        if Course.objects.filter(
            department=department,
            course=course,
            course_semester=course_semester,
            managed_by=managed_by
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(
                "A course with these details already exists."
            )
        
        return data

class CreateCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'department',
            'course',
            'course_year',
            'course_semester',
            'lecture_hours',
            'tutorial_hours',
            'practical_hours',
            'credits',
            'managed_by',
            'regulation',
            'course_type',
            'elective_type',
            'lab_type',
            'lab_pref',
            'no_of_students',
        ]

    def validate(self, data):
        department = data.get('department')
        course = data.get('course')
        course_semester = data.get('course_semester')
        managed_by = data.get('managed_by')

        if Course.objects.filter(
            department=department,
            course=course,
            course_semester=course_semester,
            managed_by=managed_by
        ).exists():
            raise serializers.ValidationError(
                "A course with these details already exists."
            )
        
        return data

class UpdateCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'course_year',
            'course_semester',
            'lecture_hours',
            'tutorial_hours',
            'practical_hours',
            'credits',
            'regulation',
            'course_type',
            'elective_type',
            'lab_type',
            'lab_pref',
            'no_of_students',
        ]

    def validate(self, data):
        instance = self.instance
        department = instance.for_dept
        course = instance.course
        course_semester = data.get('course_semester', instance.course_semester)
        managed_by = instance.managed_by

        if Course.objects.filter(
            for_dept=department,
            course=course,
            course_semester=course_semester,
            managed_by=managed_by
        ).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError(
                "A course with these details already exists."
            )
        
        return data