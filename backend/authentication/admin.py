from django.contrib import admin
from django.contrib.admin import ModelAdmin
from .models import User, BookingOTP, ForgetPassword, BlockedStudents

class CustomUserAdmin(ModelAdmin):
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

class ForgetPasswordAdmin(admin.ModelAdmin):
    list_display = ('user', 'code')
    search_fields = ('user__email', 'code')

class BlockedStudentsAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'dept', 'year')
    search_fields = ('email', 'name', 'dept')
    list_filter = ('dept', 'year')

admin.site.register(User, CustomUserAdmin)
# admin.site.register(BookingOTP, BookingOTPAdmin)  # if you need it later
admin.site.register(ForgetPassword, ForgetPasswordAdmin)
admin.site.register(BlockedStudents, BlockedStudentsAdmin)
