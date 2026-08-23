from django.contrib import admin

from .models import Project, ProjectMembership, Task, TimeEntry


class ProjectMembershipInline(admin.TabularInline):
    model = ProjectMembership
    extra = 0


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'start_date', 'end_date', 'created_by')
    list_filter = ('status',)
    search_fields = ('name', 'description')
    inlines = (ProjectMembershipInline,)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'weight', 'status', 'approved_progress', 'progress_state', 'assignee')
    list_filter = ('status', 'progress_state', 'project')
    search_fields = ('title', 'description')


@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'work_date', 'duration_minutes')
    list_filter = ('project',)
    search_fields = ('user__username', 'project__name')
