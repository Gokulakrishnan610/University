from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from .models import Teacher

class TeacherResource(resources.ModelResource):
    class Meta:
        model = Teacher
        fields = (
            'id',
            'teacher__email',
            'teacher__first_name',
            'teacher__last_name',
            'dept',
            'staff_code',
            'teacher_specialisation',
            'teacher_working_hours',
        )
        export_order = fields

class TeacherAdmin(ImportExportModelAdmin):
    resource_class = TeacherResource

    list_display = ('teacher', 'dept', 'staff_code', 'teacher_specialisation', 'teacher_working_hours')
    search_fields = ('teacher__email', 'teacher__first_name', 'teacher__last_name', 'staff_code', 'teacher_specialisation')
    list_filter = ('dept', 'teacher_working_hours')
    ordering = ('staff_code',)

admin.site.register(Teacher, TeacherAdmin)