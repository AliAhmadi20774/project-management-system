from rest_framework import serializers
from django.utils import timezone

from .models import Project, ProjectMembership, Task, TimeEntry


class ProjectSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    task_count = serializers.SerializerMethodField()
    completed_task_count = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            'id', 'name', 'description', 'status', 'start_date', 'end_date', 'created_by',
            'created_by_name', 'task_count', 'completed_task_count', 'progress', 'member_count',
            'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'created_by', 'created_by_name', 'task_count', 'completed_task_count',
            'progress', 'member_count', 'created_at', 'updated_at',
        )

    @staticmethod
    def get_task_count(project):
        return project.tasks.count()

    @staticmethod
    def get_completed_task_count(project):
        return project.tasks.filter(status=Task.Status.DONE).count()

    @staticmethod
    def get_progress(project):
        # A task only affects its project by its configured weight.  The value
        # used here is the observer-approved progress, never the submitted one.
        return round(sum(
            task.approved_progress * task.weight for task in project.tasks.all()
        ) / 100)

    @staticmethod
    def get_member_count(project):
        return project.memberships.values('user_id').distinct().count()


class ProjectMembershipSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ProjectMembership
        fields = ('id', 'project', 'user', 'user_name', 'user_email', 'role', 'created_at')
        read_only_fields = ('id', 'user_name', 'user_email', 'created_at')

    def get_user_name(self, membership):
        return membership.user.get_full_name() or membership.user.username


class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.SerializerMethodField()
    reported_by_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    initial_progress = serializers.IntegerField(
        write_only=True, required=False, default=0, min_value=0, max_value=100
    )

    class Meta:
        model = Task
        fields = (
            'id', 'project', 'title', 'description', 'status', 'start_date', 'end_date', 'assignee', 'assignee_name',
            'weight', 'initial_progress', 'reported_progress', 'approved_progress', 'progress_state', 'reported_by',
            'reported_by_name', 'reviewed_by', 'reviewed_by_name', 'review_comment',
            'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'reported_progress', 'approved_progress', 'progress_state', 'reported_by',
            'reported_by_name', 'reviewed_by', 'reviewed_by_name', 'review_comment',
            'created_at', 'updated_at',
        )

    @staticmethod
    def _name(user):
        return user.get_full_name() or user.username if user else None

    def get_assignee_name(self, task):
        return self._name(task.assignee)

    def get_reported_by_name(self, task):
        return self._name(task.reported_by)

    def get_reviewed_by_name(self, task):
        return self._name(task.reviewed_by)

    def validate(self, attrs):
        start_date = attrs.get('start_date', self.instance.start_date if self.instance else None)
        end_date = attrs.get('end_date', self.instance.end_date if self.instance else None)
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({'end_date': 'End date must be on or after the start date.'})
        project = attrs.get('project', self.instance.project if self.instance else None)
        weight = attrs.get('weight', self.instance.weight if self.instance else None)
        if project and weight is not None:
            other_tasks = Task.objects.filter(project=project)
            if self.instance:
                other_tasks = other_tasks.exclude(pk=self.instance.pk)
            assigned_weight = sum(other_tasks.values_list('weight', flat=True))
            if assigned_weight + weight > 100:
                raise serializers.ValidationError({
                    'weight': f'Task weights for a project cannot exceed 100%. {100 - assigned_weight}% is available.'
                })
        assignee = attrs.get('assignee', self.instance.assignee if self.instance else None)
        if assignee and not ProjectMembership.objects.filter(project=project, user=assignee).exists():
            raise serializers.ValidationError({'assignee': 'Assignee must be a member of this project.'})
        return attrs

    def create(self, validated_data):
        initial_progress = validated_data.pop('initial_progress', 0)
        if initial_progress:
            validated_data['reported_progress'] = initial_progress
            validated_data['reported_by'] = self.context['request'].user
            validated_data['progress_state'] = Task.ProgressState.PENDING_REVIEW
        return super().create(validated_data)


class ProgressSubmissionSerializer(serializers.Serializer):
    progress = serializers.IntegerField(min_value=0, max_value=100)


class ProgressReviewSerializer(serializers.Serializer):
    approved = serializers.BooleanField()
    comment = serializers.CharField(required=False, allow_blank=True)


class TimeEntrySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = TimeEntry
        fields = ('id', 'project', 'user', 'user_name', 'work_date', 'duration_minutes', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'user_name', 'created_at', 'updated_at')

    def get_user_name(self, entry):
        return entry.user.get_full_name() or entry.user.username

    def validate(self, attrs):
        request = self.context['request']
        project = attrs.get('project', self.instance.project if self.instance else None)
        work_date = attrs.get('work_date', self.instance.work_date if self.instance else timezone.localdate())
        queryset = TimeEntry.objects.filter(project=project, user=request.user, work_date=work_date)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError({
                'work_date': 'A daily time entry already exists for this project.',
            })
        return attrs
