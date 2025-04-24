from django.contrib import admin
from .models import Course

class CourseAdmin(admin.ModelAdmin):
    list_display = (
        'get_course_id', 
        'get_course_name', 
        'department', 
        'course_year', 
        'course_semester', 
        'regulation', 
        'course_type', 
        'credits',
        'managed_by'
    )
    search_fields = ('course__course_id', 'course__course_name', 'department__dept_name')
    list_filter = (
        'department', 
        'course_year', 
        'course_semester', 
        'regulation', 
        'course_type',
        'elective_type',
        'managed_by'
    )
    ordering = ('course__course_id',)
    list_select_related = ('course', 'department', 'managed_by')
    
    def get_course_id(self, obj):
        return obj.course.course_id
    get_course_id.short_description = 'Course ID'
    get_course_id.admin_order_field = 'course__course_id'
    
    def get_course_name(self, obj):
        return obj.course.course_name
    get_course_name.short_description = 'Course Name'
    get_course_name.admin_order_field = 'course__course_name'
    
    # If you want to filter courses by the logged-in user's department (for HODs)
    # def get_queryset(self, request):
    #     qs = super().get_queryset(request)
    #     if request.user.is_superuser:
    #         return qs
    #     try:
    #         # Assuming Department has a 'hod' field pointing to User
    #         department = request.user.hod_department
    #         return qs.filter(department=department)
    #     except AttributeError:
    #         return qs.none()

admin.site.register(Course, CourseAdmin)