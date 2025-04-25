from django.contrib import admin
from .models import Slot

# Register your models here.
@admin.register(Slot)
class SlotAdmin(admin.ModelAdmin):
    list_display = ['slot_name', 'slot_start_time', 'slot_end_time']
    list_filter = list_display
    search_fields = list_display