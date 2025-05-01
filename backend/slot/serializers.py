from rest_framework import serializers
from .models import Slot, TeacherSlotAssignment

class SlotSerializer(serializers.ModelSerializer):

    class Meta:
        model = Slot
        fields = ['slot_name', 'slot_start_time', 'slot_end_time']
        
class TeacherSlotAssignmentSerializer(serializers.ModelSerializer):
    slot = SlotSerializer()
    day_name = serializers.SerializerMethodField()
    class Meta:
        model = TeacherSlotAssignment
        fields = ['slot_id', 'day_of_week', 'id', 'slot', 'day_of_week', 'day_name']
        extra_kwargs = {
            'slot_id': {'source': 'slot', 'required': True},
            'day_of_week': {'required': True}
        }

    def get_day_name(self, obj):
        return dict(TeacherSlotAssignment.DAYS_OF_WEEK)[obj.day_of_week]