from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import Student

User = get_user_model()

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'name', 'email', 'user_type', 'is_staff', 'is_active')
    search_fields = ('username', 'name', 'email')
    list_filter = ('user_type', 'is_active', 'is_staff')
    ordering = ('username',)
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('name', 'email', 'user_type')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'name', 'email', 'password1', 'password2', 'user_type'),
        }),
    )

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('enrollment_number', 'user', 'program', 'batch_year', 'current_semester', 'admission_date')
    search_fields = ('enrollment_number', 'user__username', 'user__name', 'program')
    list_filter = ('program', 'batch_year', 'current_semester', 'admission_date')
    raw_id_fields = ('user',)
