from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Slot, TeacherSlotAssignment
from teacher.models import Teacher
from django.core.exceptions import ValidationError

@admin.register(Slot)
class SlotAdmin(ModelAdmin):
    list_display = ['slot_name', 'slot_start_time', 'slot_end_time']
    list_filter = list_display
    search_fields = list_display

@admin.register(TeacherSlotAssignment)
class TeacherSlotAssignmentAdmin(ModelAdmin):
    list_display = ['teacher', 'slot', 'day_of_week', 'get_day_name']
    list_filter = ['day_of_week', 'slot', 'teacher']
    search_fields = ['teacher__teacher_id__first_name', 'teacher__teacher_id__last_name', 'slot__slot_name']
    autocomplete_fields = ['teacher', 'slot']
    ordering = ['day_of_week', 'slot__slot_start_time']

    def get_readonly_fields(self, request, obj=None):
        """Make fields readonly when editing to prevent day/slot changes"""
        if obj:  # Editing an existing object
            return ['teacher', 'day_of_week']
        return super().get_readonly_fields(request, obj)
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        
        # Custom clean method for the form
        def clean_form(form):
            cleaned_data = super(form.__class__, form).clean()
            
            # For new assignments, check day availability
            if not obj and 'teacher' in cleaned_data and 'day_of_week' in cleaned_data:
                if TeacherSlotAssignment.objects.filter(
                    teacher=cleaned_data['teacher'],
                    day_of_week=cleaned_data['day_of_week']
                ).exists():
                    raise ValidationError(
                        "This teacher already has an assignment on the selected day"
                    )
            return cleaned_data
        
        form.clean = clean_form
        return form

    def get_day_name(self, obj):
        return dict(TeacherSlotAssignment.DAYS_OF_WEEK).get(obj.day_of_week, '')
    get_day_name.short_description = 'Day'
    get_day_name.admin_order_field = 'day_of_week'

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'teacher':
            kwargs['queryset'] = Teacher.objects.filter(resignation_status='active').select_related(
                'teacher_id', 'dept_id'
            ).order_by('teacher_id__last_name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'teacher', 'teacher__teacher_id', 'teacher__dept_id', 'slot'
        )