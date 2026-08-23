from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'first_name', 'last_name', 'department', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'department')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    fieldsets = UserAdmin.fieldsets + (
        ('Organizational information', {'fields': ('department', 'job_title', 'mobile')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Organizational information', {'fields': ('first_name', 'last_name', 'email', 'department', 'job_title', 'mobile')}),
    )
