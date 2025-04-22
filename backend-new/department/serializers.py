from rest_framework import serializers
from .models import Department
from authentication.serializers import UserSerializer 

class DepartmentSerializer(serializers.ModelSerializer):
    hod_detail = UserSerializer(source='hod', read_only=True)
    
    class Meta:
        model = Department
        fields = [
            'id',
            'dept_name',
            'date_established',
            'contact_info',
            'hod',
            'hod_detail' 
        ]
        extra_kwargs = {
            'hod': {'write_only': True} 
        }

    def validate(self, data):
        hod = data.get('hod')
        
        if hod and hod.user_type != 'teacher':
            raise serializers.ValidationError(
                {"hod": "Only teachers can be assigned as HOD"}
            )
            
        return data

    def create(self, validated_data):
        return Department.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.dept_name = validated_data.get('dept_name', instance.dept_name)
        instance.date_established = validated_data.get('date_established', instance.date_established)
        instance.contact_info = validated_data.get('contact_info', instance.contact_info)
        instance.hod = validated_data.get('hod', instance.hod)
        instance.save()
        return instance