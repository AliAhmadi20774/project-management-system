from django.db import models


class Department(models.Model):
    name = models.CharField('department name', max_length=120, unique=True)
    code = models.CharField('department code', max_length=20, unique=True)
    description = models.TextField('description', blank=True)
    is_active = models.BooleanField('is active', default=True)
    created_at = models.DateTimeField('created at', auto_now_add=True)
    updated_at = models.DateTimeField('updated at', auto_now=True)

    class Meta:
        ordering = ('name',)
        verbose_name = 'department'
        verbose_name_plural = 'departments'

    def __str__(self):
        return f'{self.code} — {self.name}'
