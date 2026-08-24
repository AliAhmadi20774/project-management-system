from rest_framework.permissions import BasePermission

from projects.permissions import can_create_projects


class CanManageUsers(BasePermission):
    """System admins and global project managers may list/create users."""

    def has_permission(self, request, view):
        return can_create_projects(request.user)
