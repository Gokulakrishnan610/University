from django.contrib import admin
from .models import Department

class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('dept_name', 'date_established', 'contact_info')
    search_fields = ('dept_name', 'contact_info')
    list_filter = ('date_established',)
    ordering = ('dept_name',)

admin.site.register(Department, DepartmentAdmin)
