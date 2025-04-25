from rest_framework import serializers
from .models import Slot

class SlotSerializer(serializers.ModelSerializer):

    class Meta:
        model = Slot
        fields = ['slot_name', 'slot_start_time', 'slot_end_time']
        