from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class Project(models.Model):
    class Status(models.TextChoices):
        PLANNING = 'planning', 'Planning'
        ACTIVE = 'active', 'Active'
        ON_HOLD = 'on_hold', 'On hold'
        COMPLETED = 'completed', 'Completed'

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status, default=Status.PLANNING)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='created_projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.name


class ProjectMembership(models.Model):
    class Role(models.TextChoices):
        LEAD = 'lead', 'Project lead'
        OBSERVER = 'observer', 'Project observer'
        MEMBER = 'member', 'Team member'

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_memberships')
    role = models.CharField(max_length=20, choices=Role)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('project', 'user', 'role'), name='unique_project_membership_role')]
        ordering = ('project', 'role', 'user__last_name', 'user__first_name')

    def __str__(self):
        return f'{self.user} — {self.project} ({self.get_role_display()})'


class Task(models.Model):
    class Status(models.TextChoices):
        BACKLOG = 'backlog', 'Backlog'
        TODO = 'todo', 'To do'
        IN_PROGRESS = 'in_progress', 'In progress'
        IN_REVIEW = 'in_review', 'In review'
        DONE = 'done', 'Done'

    class ProgressState(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PENDING_REVIEW = 'pending_review', 'Pending review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=250)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status, default=Status.TODO)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_tasks',
    )
    weight = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text='Contribution of this task to its project, expressed as a percentage.',
    )
    reported_progress = models.PositiveSmallIntegerField(default=0, validators=[MaxValueValidator(100)])
    approved_progress = models.PositiveSmallIntegerField(default=0, validators=[MaxValueValidator(100)])
    progress_state = models.CharField(max_length=20, choices=ProgressState, default=ProgressState.DRAFT)
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='reported_tasks')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_tasks')
    review_comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('project', 'created_at')

    def clean(self):
        super().clean()
        if not self.project_id or not self.weight:
            return
        assigned_weight = Task.objects.filter(project_id=self.project_id).exclude(pk=self.pk).aggregate(
            total=models.Sum('weight')
        )['total'] or 0
        if assigned_weight + self.weight > 100:
            raise ValidationError({
                'weight': f'Task weights for a project cannot exceed 100%. {100 - assigned_weight}% is available.'
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class TimeEntry(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='time_entries')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='time_entries')
    work_date = models.DateField(default=timezone.localdate)
    duration_minutes = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-work_date',)
        constraints = [
            models.UniqueConstraint(
                fields=('project', 'user', 'work_date'),
                name='unique_daily_project_time_entry',
            ),
        ]

    def __str__(self):
        return f'{self.user} — {self.project} ({self.work_date}: {self.duration_minutes} min)'
