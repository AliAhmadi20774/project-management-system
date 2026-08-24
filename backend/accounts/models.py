from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models


personnel_number_validator = RegexValidator(
    regex=r'^\d{1,20}$',
    message='Personnel number must contain between 1 and 20 digits.',
)


class User(AbstractUser):
    username = models.CharField(
        'personnel number',
        max_length=20,
        unique=True,
        help_text='Unique personnel number with up to 20 digits.',
        validators=[personnel_number_validator],
        error_messages={'unique': 'A user with this personnel number already exists.'},
    )
    email = models.EmailField('organizational email', unique=True, blank=True, null=True)
    avatar = models.ImageField('profile image', upload_to='user_avatars/', blank=True, null=True)
    avatar_seed = models.CharField('default avatar', max_length=20, default='young-man')
    mobile = models.CharField('mobile number', max_length=20, blank=True, null=True, unique=True)
    job_title = models.CharField('job title', max_length=150, blank=True)
    department = models.ForeignKey(
        'organizations.Department',
        verbose_name='department',
        related_name='employees',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ('first_name', 'last_name')

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.username})'
