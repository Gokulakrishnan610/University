from django.contrib import admin
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from .models import Teacher, TeacherAvailability

class TeacherResource(resources.ModelResource):
    class Meta:
        model = Teacher
        fields = (
            'id',
            'teacher_id__email',
            'teacher_id__first_name',
            'teacher_id__last_name',
            'dept_id',
            'staff_code',
            'teacher_specialisation',
            'teacher_working_hours',
            'teacher_role',
            'availability_type',
            'is_industry_professional',
        )
        export_order = fields

class TeacherAvailabilityInline(admin.TabularInline):
    model = TeacherAvailability
    extra = 0
    fields = ('day_of_week', 'start_time', 'end_time')

class TeacherAdmin(ImportExportModelAdmin, ModelAdmin):
    resource_class = TeacherResource
    inlines = [TeacherAvailabilityInline]

    list_display = ('teacher_id', 'dept_id', 'staff_code', 'teacher_role', 'teacher_specialisation', 
                    'teacher_working_hours', 'is_industry_professional', 'availability_type')
    search_fields = ('teacher_id__email', 'teacher_id__first_name', 'teacher_id__last_name', 'staff_code', 'teacher_specialisation')
    list_filter = ('dept_id', 'teacher_working_hours', 'teacher_role', 'is_industry_professional', 'availability_type')
    ordering = ('staff_code',)
    
    # Group fields in fieldsets
    fieldsets = (
        ('Basic Information', {
            'fields': ('teacher_id', 'dept_id', 'staff_code', 'teacher_role')
        }),
        ('Teaching Details', {
            'fields': ('teacher_specialisation', 'teacher_working_hours')
        }),
        ('Availability', {
            'fields': ('availability_type', 'is_industry_professional'),
            'classes': ('collapse',),
            'description': 'Industry professionals/POPs need specific availability slots defined'
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Make is_industry_professional readonly as it's set automatically based on role"""
        return ('is_industry_professional',)

    def save_model(self, request, obj, form, change):
        """Additional validation before saving"""
        # Make sure industry professionals have limited availability
        if obj.is_industry_professional:
            obj.availability_type = 'limited'
        super().save_model(request, obj, form, change)


admin.site.register(Teacher, TeacherAdmin)
admin.site.register(TeacherAvailability)