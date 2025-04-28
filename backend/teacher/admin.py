from django.contrib import admin
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from .models import Teacher

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
        )
        export_order = fields

class TeacherAdmin(ImportExportModelAdmin, ModelAdmin):
    resource_class = TeacherResource

    list_display = ('teacher_id', 'dept_id', 'staff_code', 'teacher_specialisation', 'teacher_working_hours')
    search_fields = ('teacher_id__email', 'teacher_id__first_name', 'teacher_id__last_name', 'staff_code', 'teacher_specialisation')
    list_filter = ('dept_id', 'teacher_working_hours')
    ordering = ('staff_code',)

admin.site.register(Teacher, TeacherAdmin)