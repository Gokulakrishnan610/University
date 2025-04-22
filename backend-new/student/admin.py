from django.contrib import admin
from .models import Student

class StudentAdmin(admin.ModelAdmin):
    list_display = ('student', 'batch', 'current_semester')
    search_fields = ('student__email', 'student__first_name', 'student__last_name', 'batch')
    list_filter = ('batch', 'current_semester')
    ordering = ('batch', 'student__first_name')

admin.site.register(Student, StudentAdmin)
