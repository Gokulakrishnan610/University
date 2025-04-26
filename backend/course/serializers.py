from rest_framework import serializers
from .models import Course, CourseResourceAllocation, CourseSlotPreference, CourseRoomPreference
from department.serializers import DepartmentSerializer
from courseMaster.serializers import CourseMasterSerializer
from slot.serializers import SlotSerializer
from rooms.serializers import RoomSerializer

class CourseSerializer(serializers.ModelSerializer):
    course_detail = CourseMasterSerializer(source='course_id', read_only=True)
    for_dept_detail = DepartmentSerializer(source='for_dept_id', read_only=True)
    teaching_dept_detail = DepartmentSerializer(source='teaching_dept_id', read_only=True)
    relationship_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id',
            'course_id',
            'course_detail',
            'course_year',
            'course_semester',
            'lecture_hours',
            'tutorial_hours',
            'practical_hours',
            'credits',
            'for_dept_id',
            'for_dept_detail',
            'teaching_dept_id',
            'teaching_dept_detail',
            'need_assist_teacher',
            'regulation',
            'course_type',
            'elective_type',
            'lab_type',
            'no_of_students',
            'is_zero_credit_course',
            'teaching_status',
            'relationship_type'
        ]
    
    def get_relationship_type(self, obj):
        """
        Determine the relationship type between departments for this course:
        1. SELF_OWNED_SELF_TAUGHT: course owned by dept X, for dept X, taught by dept X
        2. SELF_OWNED_OTHER_TAUGHT: course owned by dept X, for dept X, taught by dept Y
        3. OTHER_OWNED_SELF_TAUGHT: course owned by dept Y, for dept X, taught by dept X
        4. OTHER_OWNED_OTHER_TAUGHT: course owned by dept Y, for dept X, taught by dept Y
        5. SELF_OWNED_FOR_OTHER_SELF_TAUGHT: course owned by dept X, for dept Y, taught by dept X
        6. SELF_OWNED_FOR_OTHER_OTHER_TAUGHT: course owned by dept X, for dept Y, taught by dept Z
        """
        owning_dept_id = obj.course_id.course_dept_id.id if obj.course_id and obj.course_id.course_dept_id else None
        for_dept_id = obj.for_dept_id.id if obj.for_dept_id else None
        teaching_dept_id = obj.teaching_dept_id.id if obj.teaching_dept_id else None
        
        if owning_dept_id == for_dept_id == teaching_dept_id:
            return {
                "code": "SELF_OWNED_SELF_TAUGHT",
                "description": "Course owned, taught, and taken by the same department"
            }
            
        elif owning_dept_id == for_dept_id and owning_dept_id != teaching_dept_id:
            return {
                "code": "SELF_OWNED_OTHER_TAUGHT",
                "description": "Course owned and taken by this department, but taught by another department"
            }
            
        elif owning_dept_id != for_dept_id and for_dept_id == teaching_dept_id:
            return {
                "code": "OTHER_OWNED_SELF_TAUGHT",
                "description": "Course owned by another department, but taught and taken by this department"
            }
            
        elif owning_dept_id != for_dept_id and owning_dept_id != teaching_dept_id and for_dept_id != teaching_dept_id:
            return {
                "code": "OTHER_OWNED_OTHER_TAUGHT",
                "description": "Course owned by one department, taken by this department, taught by a third department"
            }
            
        elif owning_dept_id == teaching_dept_id and owning_dept_id != for_dept_id:
            return {
                "code": "SELF_OWNED_FOR_OTHER_SELF_TAUGHT",
                "description": "Course owned and taught by this department for another department"
            }
            
        elif owning_dept_id != teaching_dept_id and owning_dept_id != for_dept_id and for_dept_id != teaching_dept_id:
            return {
                "code": "SELF_OWNED_FOR_OTHER_OTHER_TAUGHT",
                "description": "Course owned by this department, for another department, taught by a third department"
            }
            
        return {
            "code": "UNKNOWN",
            "description": "Unknown relationship type"
        }
        
    def validate(self, data):
        for_dept_id = data.get('for_dept_id', self.instance.for_dept_id if self.instance else None)
        course_id = data.get('course_id', self.instance.course_id if self.instance else None)
        course_semester = data.get('course_semester', self.instance.course_semester if self.instance else None)
        teaching_dept_id = data.get('teaching_dept_id', self.instance.teaching_dept_id if self.instance else None)

        if Course.objects.filter(
            for_dept_id=for_dept_id,
            course_id=course_id,
            course_semester=course_semester,
            teaching_dept_id=teaching_dept_id
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(
                "A course with these details already exists."
            )
        
        return data

class CourseSlotPreferenceSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course_id', read_only=True)
    slot_detail = SlotSerializer(source='slot_id', read_only=True)
    
    class Meta:
        model = CourseSlotPreference
        fields = [
            'id',
            'course_id',
            'course_detail',
            'slot_id',
            'slot_detail',
            'preference_level'
        ]

class CourseRoomPreferenceSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course_id', read_only=True)
    room_detail = RoomSerializer(source='room_id', read_only=True)
    
    class Meta:
        model = CourseRoomPreference
        fields = [
            'id',
            'course_id',
            'course_detail',
            'room_id',
            'room_detail',
            'preference_level',
            'preferred_for',
            'tech_level_preference'
        ]

class CourseResourceAllocationSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course_id', read_only=True)
    original_dept_detail = DepartmentSerializer(source='original_dept_id', read_only=True)
    teaching_dept_detail = DepartmentSerializer(source='teaching_dept_id', read_only=True)
    
    class Meta:
        model = CourseResourceAllocation
        fields = [
            'id',
            'course_id',
            'course_detail',
            'original_dept_id',
            'original_dept_detail',
            'teaching_dept_id',
            'teaching_dept_detail',
            'allocation_reason',
            'allocation_date',
            'status'
        ]

class CreateCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'course_id',
            'course_year',
            'course_semester',
            'lecture_hours',
            'tutorial_hours',
            'practical_hours',
            'credits',
            'for_dept_id',
            'teaching_dept_id',
            'need_assist_teacher',
            'regulation',
            'course_type',
            'elective_type',
            'lab_type',
            'no_of_students',
            'is_zero_credit_course',
            'teaching_status'
        ]

    def validate(self, data):
        course_id = data.get('course_id')
        for_dept_id = data.get('for_dept_id')
        course_semester = data.get('course_semester')
        teaching_dept_id = data.get('teaching_dept_id')

        if Course.objects.filter(
            course_id=course_id,
            for_dept_id=for_dept_id,
            course_semester=course_semester,
            teaching_dept_id=teaching_dept_id
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
            'for_dept_id',
            'teaching_dept_id',
            'need_assist_teacher',
            'regulation',
            'course_type',
            'elective_type',
            'lab_type',
            'no_of_students',
            'is_zero_credit_course',
            'teaching_status'
        ]

    def validate(self, data):
        instance = self.instance
        course_id = instance.course_id
        for_dept_id = data.get('for_dept_id', instance.for_dept_id)
        course_semester = data.get('course_semester', instance.course_semester)
        teaching_dept_id = data.get('teaching_dept_id', instance.teaching_dept_id)

        if Course.objects.filter(
            course_id=course_id,
            for_dept_id=for_dept_id,
            course_semester=course_semester,
            teaching_dept_id=teaching_dept_id
        ).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError(
                "A course with these details already exists."
            )
        
        return data