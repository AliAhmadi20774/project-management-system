from .models import ProjectMembership

PROJECT_MANAGER_GROUP = 'Project Managers'


def is_system_admin(user):
    return bool(user and user.is_authenticated and user.is_superuser)


def can_create_projects(user):
    return is_system_admin(user) or user.groups.filter(name=PROJECT_MANAGER_GROUP).exists()


def has_project_role(user, project, *roles):
    if is_system_admin(user):
        return True
    return ProjectMembership.objects.filter(project=project, user=user, role__in=roles).exists()


def can_manage_project(user, project):
    return has_project_role(user, project, ProjectMembership.Role.MANAGER)


def can_manage_tasks(user, project):
    return has_project_role(
        user,
        project,
        ProjectMembership.Role.MANAGER,
        ProjectMembership.Role.LEAD,
    )


def can_submit_progress(user, project):
    return has_project_role(user, project, ProjectMembership.Role.LEAD)


def can_review_progress(user, project):
    return has_project_role(user, project, ProjectMembership.Role.OBSERVER)


def can_log_time(user, project):
    return has_project_role(user, project, ProjectMembership.Role.MEMBER)
