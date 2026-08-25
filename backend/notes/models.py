from django.conf import settings
from django.db import models


class PersonalNote(models.Model):
    class Folder(models.TextChoices):
        WORK = 'work', 'Work'
        PERSONAL = 'personal', 'Personal'
        IDEAS = 'ideas', 'Ideas'
        ARCHIVE = 'archive', 'Archive'

    class Color(models.TextChoices):
        BLUE = 'blue', 'Blue'
        VIOLET = 'violet', 'Violet'
        EMERALD = 'emerald', 'Green'
        AMBER = 'amber', 'Amber'
        ROSE = 'rose', 'Rose'
        SLATE = 'slate', 'Slate'

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='personal_notes')
    title = models.CharField(max_length=200, blank=True)
    body = models.TextField(blank=True)
    content = models.JSONField(default=list, blank=True)
    folder = models.CharField(max_length=16, choices=Folder.choices, default=Folder.WORK)
    color = models.CharField(max_length=16, choices=Color.choices, default=Color.BLUE)
    tags = models.JSONField(default=list, blank=True)
    is_pinned = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-is_pinned', '-updated_at')

    def __str__(self):
        return self.title or 'Untitled note'
