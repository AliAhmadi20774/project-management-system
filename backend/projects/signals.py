from django.contrib.auth.models import Group
from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .permissions import PROJECT_MANAGER_GROUP


@receiver(post_migrate)
def create_project_manager_group(sender, **kwargs):
    if sender.name == 'projects':
        Group.objects.get_or_create(name=PROJECT_MANAGER_GROUP)
