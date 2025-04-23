from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from .models import Student

class StudentResource(resources.ModelResource):
    class Meta:
        model = Student
        fields = (
            'id',
            'student__email',
            'student__first_name',
            'student__last_name',
            'batch',
            'current_semester',
        )
        export_order = fields  

class StudentAdmin(ImportExportModelAdmin):
    resource_class = StudentResource 

    list_display = ('student', 'batch', 'current_semester')
    search_fields = ('student__email', 'student__first_name', 'student__last_name', 'batch')
    list_filter = ('batch', 'current_semester')
    ordering = ('batch', 'student__first_name')

admin.site.register(Student, StudentAdmin)