from django.contrib import admin
from django.contrib.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from .models import User, BookingOTP, ForgetPassword, BlockedStudents

class UserResource(resources.ModelResource):
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'is_staff',
            'is_superuser',
            'user_type',
            'gender',
            'phone_number',
            'last_login',
            'date_joined',
        )
        export_order = fields

class CustomUserAdmin(ImportExportModelAdmin):
    resource_class = UserResource  

    list_display = ('email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    list_filter = ('is_staff', 'is_superuser', 'user_type', 'gender')

    fieldsets = (
        (None, {'fields': ('email', 'password', 'user_type')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'gender')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
class ForgetPasswordAdmin(ImportExportModelAdmin):
    list_display = ('user', 'code')
    search_fields = ('user__email', 'code')

class BlockedStudentsResource(resources.ModelResource):
    class Meta:
        model = BlockedStudents
        fields = ('id', 'email', 'name', 'dept', 'year')
        export_order = fields

class BlockedStudentsAdmin(ImportExportModelAdmin):
    resource_class = BlockedStudentsResource

    list_display = ('email', 'name', 'dept', 'year')
    search_fields = ('email', 'name', 'dept')
    list_filter = ('dept', 'year')

admin.site.register(User, CustomUserAdmin)
admin.site.register(ForgetPassword, ForgetPasswordAdmin)
admin.site.register(BlockedStudents, BlockedStudentsAdmin)