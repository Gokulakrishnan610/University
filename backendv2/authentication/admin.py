from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, BookingOTP, ForgetPassword, BlockedStudents

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'dept', 'roll_no', 'year')
    search_fields = ('email', 'first_name', 'last_name', 'roll_no')
    ordering = ('email',)
    list_filter = ('is_staff', 'is_superuser', 'dept', 'year', 'student_type', 'degree_type')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'dept', 'roll_no', 'year', 'phone_number', 'parent_phone_number', 'gender')}),
        ('Academic info', {'fields': ('student_type', 'degree_type')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

# class BookingOTPAdmin(admin.ModelAdmin):
#     list_display = ('user', 'code', 'is_verified')
#     search_fields = ('user__email', 'code')
#     list_filter = ('is_verified',)

class ForgetPasswordAdmin(admin.ModelAdmin):
    list_display = ('user', 'code')
    search_fields = ('user__email', 'code')

class BlockedStudentsAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'dept', 'year')
    search_fields = ('email', 'name', 'dept')
    list_filter = ('dept', 'year')

admin.site.register(User, CustomUserAdmin)
# admin.site.register(BookingOTP, BookingOTPAdmin)
admin.site.register(ForgetPassword, ForgetPasswordAdmin)
admin.site.register(BlockedStudents, BlockedStudentsAdmin)
