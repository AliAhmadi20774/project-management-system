from .models import ProjectMembership

PROJECT_MANAGER_GROUP = 'Project Managers'


def is_system_admin(user):
    return bool(user and user.is_authenticated and user.is_superuser)


def can_create_projects(user):
    return bool(
        is_system_admin(user)
        or (user and user.is_authenticated and user.groups.filter(name=PROJECT_MANAGER_GROUP).exists())
    )


def has_project_role(user, project, *roles):
    if is_system_admin(user):
        return True
    return ProjectMembership.objects.filter(project=project, user=user, role__in=roles).exists()


def can_manage_project(user, project):
    # "Project Manager" is a global permission, not a project membership role.
    # Leads, observers and members therefore cannot administer a project.
    return can_create_projects(user)


def can_manage_project_members(user, project):
    """Only global Project Managers and System Admins manage a project's roster."""
    return can_create_projects(user)


def can_manage_tasks(user, project):
    return is_system_admin(user) or has_project_role(
        user,
        project,
        ProjectMembership.Role.LEAD,
    )


def can_submit_progress(user, project):
    return has_project_role(user, project, ProjectMembership.Role.LEAD)


def can_review_progress(user, project):
    return has_project_role(user, project, ProjectMembership.Role.OBSERVER)


def can_log_time(user, project):
    """Every project participant may log their own daily time."""
    return has_project_role(
        user,
        project,
        ProjectMembership.Role.LEAD,
        ProjectMembership.Role.OBSERVER,
        ProjectMembership.Role.MEMBER,
    )


def can_log_time_for(user, project, target_user):
    """Leads may record time for their own project members; admins for anyone."""
    if is_system_admin(user):
        return True
    return (
        has_project_role(user, project, ProjectMembership.Role.LEAD)
        and has_project_role(target_user, project, ProjectMembership.Role.LEAD, ProjectMembership.Role.OBSERVER, ProjectMembership.Role.MEMBER)
    )
