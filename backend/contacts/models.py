from django.conf import settings
from django.db import models


class Contact(models.Model):
    """A private, manually entered address-book contact."""

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contacts')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=32)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('first_name', 'last_name', 'id')
        indexes = [models.Index(fields=('owner', 'last_name', 'first_name'))]

    def __str__(self):
        return f'{self.first_name} {self.last_name}'
