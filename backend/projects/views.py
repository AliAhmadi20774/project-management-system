from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import IntegerField, Q, Sum, Value
from django.db.models.functions import Coalesce

from .models import CalendarEvent, Project, ProjectFavorite, ProjectMembership, Task, TimeEntry, WorkLog
from .permissions import can_create_projects, can_log_time, can_log_time_for, can_manage_project, can_manage_project_members, can_manage_tasks, can_review_progress, can_submit_progress, is_system_admin
from .serializers import CalendarEventSerializer, ProgressReviewSerializer, ProgressSubmissionSerializer, ProjectMembershipSerializer, ProjectSerializer, TaskSerializer, TimeEntrySerializer, WorkLogSerializer


class CalendarEventViewSet(ModelViewSet):
    serializer_class = CalendarEventSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = CalendarEvent.objects.filter(owner=self.request.user)
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')
        if start:
            queryset = queryset.filter(event_date__gte=start)
        if end:
            queryset = queryset.filter(event_date__lte=end)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.select_related('created_by').annotate(
        total_time_minutes=Coalesce(
            Sum('tasks__time_entries__duration_minutes'),
            Value(0),
            output_field=IntegerField(),
        )
    )
    serializer_class = ProjectSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('mine') == '1':
            user = self.request.user
            return queryset.filter(Q(created_by=user) | Q(memberships__user=user)).distinct()
        return queryset

    def perform_create(self, serializer):
        if not can_create_projects(self.request.user):
            raise PermissionDenied('Only system administrators and project managers can create projects.')
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        if not can_manage_project(self.request.user, serializer.instance):
            raise PermissionDenied('Only the project manager can update this project.')
        serializer.save()

    def perform_destroy(self, instance):
        if not can_manage_project(self.request.user, instance):
            raise PermissionDenied('Only the project manager can delete this project.')
        instance.delete()

    @action(detail=True, methods=('post', 'delete'), url_path='favorite')
    def favorite(self, request, pk=None):
        project = self.get_object()
        if request.method == 'POST':
            ProjectFavorite.objects.get_or_create(project=project, user=request.user)
            return Response({'is_starred': True})
        ProjectFavorite.objects.filter(project=project, user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProjectMembershipViewSet(ModelViewSet):
    queryset = ProjectMembership.objects.select_related('project', 'user').all()
    serializer_class = ProjectMembershipSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project')
        return queryset.filter(project_id=project_id) if project_id else queryset

    def perform_create(self, serializer):
        project = serializer.validated_data['project']
        if not can_manage_project(self.request.user, project):
            raise PermissionDenied('Only the project manager can assign project roles.')
        serializer.save()

    def perform_update(self, serializer):
        if not can_manage_project(self.request.user, serializer.instance.project):
            raise PermissionDenied('Only the project manager can update project roles.')
        serializer.save()

    def perform_destroy(self, instance):
        if not can_manage_project_members(self.request.user, instance.project):
            raise PermissionDenied('Only system administrators and project managers can remove project members.')

        # Removing someone from a project never deletes their account.  It also
        # intentionally leaves the project valid when it has no lead/observer.
        Task.objects.filter(project=instance.project, assignee=instance.user).update(assignee=None)
        ProjectMembership.objects.filter(project=instance.project, user=instance.user).delete()

    @action(detail=False, methods=('get',), url_path='candidates')
    def candidates(self, request):
        project_id = request.query_params.get('project')
        if not project_id:
            return Response({'detail': 'project is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not can_manage_project_members(request.user, project):
            raise PermissionDenied('Only system administrators and project managers can manage project members.')

        members = ProjectMembership.objects.filter(project=project).values_list('user_id', flat=True)
        from accounts.models import User
        users = User.objects.filter(is_active=True).exclude(id__in=members).order_by('first_name', 'last_name', 'username')
        return Response([
            {
                'id': user.id,
                'name': user.get_full_name() or user.username,
                'email': user.email,
            }
            for user in users
        ])


class TaskViewSet(ModelViewSet):
    queryset = Task.objects.select_related(
        'project', 'assignee', 'reported_by', 'reviewed_by'
    ).annotate(
        total_time_minutes=Coalesce(
            Sum('time_entries__duration_minutes'),
            Value(0),
            output_field=IntegerField(),
        )
    )
    serializer_class = TaskSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('mine') == '1':
            user = self.request.user
            queryset = queryset.filter(Q(project__created_by=user) | Q(project__memberships__user=user)).distinct()
        project_id = self.request.query_params.get('project')
        return queryset.filter(project_id=project_id) if project_id else queryset

    def perform_create(self, serializer):
        project = serializer.validated_data['project']
        if not can_manage_tasks(self.request.user, project):
            raise PermissionDenied('Only the project lead or project manager can create tasks.')
        serializer.save()

    def perform_update(self, serializer):
        if not can_manage_tasks(self.request.user, serializer.instance.project):
            raise PermissionDenied('Only the project lead or project manager can update task details.')
        serializer.save()

    def perform_destroy(self, instance):
        if not can_manage_tasks(self.request.user, instance.project):
            raise PermissionDenied('Only the project lead or project manager can delete tasks.')
        instance.delete()

    @action(detail=True, methods=('post',), url_path='duplicate')
    def duplicate(self, request, pk=None):
        task = self.get_object()
        if not can_manage_tasks(request.user, task.project):
            raise PermissionDenied('Only the project lead or system administrator can duplicate tasks.')

        allocated_weight = Task.objects.filter(project=task.project).aggregate(total=Sum('weight'))['total'] or 0
        available_weight = 100 - allocated_weight
        if available_weight < 1:
            return Response(
                {'detail': 'No project weight is available. Reduce another task weight before duplicating this task.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        duplicate = Task.objects.create(
            project=task.project,
            title=f'{task.title} (copy)'[:250],
            description=task.description,
            status=Task.Status.TODO,
            priority=task.priority,
            start_date=task.start_date,
            end_date=task.end_date,
            assignee=task.assignee,
            weight=min(task.weight, available_weight),
        )
        return Response(TaskSerializer(duplicate, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=('post',), url_path='submit-progress')
    def submit_progress(self, request, pk=None):
        task = self.get_object()
        if not can_submit_progress(request.user, task.project):
            raise PermissionDenied('Only the project lead can submit task progress.')
        serializer = ProgressSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        progress = serializer.validated_data['progress']
        task.reported_progress = progress
        task.reported_by = request.user
        task.review_comment = ''
        update_fields = ['reported_progress', 'reported_by', 'progress_state', 'review_comment', 'updated_at']
        if is_system_admin(request.user):
            task.approved_progress = progress
            task.reviewed_by = request.user
            task.progress_state = Task.ProgressState.APPROVED
            update_fields.extend(('approved_progress', 'reviewed_by'))
        else:
            task.progress_state = Task.ProgressState.PENDING_REVIEW
        task.save(update_fields=update_fields)
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=('post',), url_path='review-progress')
    def review_progress(self, request, pk=None):
        task = self.get_object()
        if not can_review_progress(request.user, task.project):
            raise PermissionDenied('Only the project observer can review task progress.')
        serializer = ProgressReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task.reviewed_by = request.user
        task.review_comment = serializer.validated_data.get('comment', '')
        if serializer.validated_data['approved']:
            task.approved_progress = task.reported_progress
            task.progress_state = Task.ProgressState.APPROVED
        else:
            task.progress_state = Task.ProgressState.REJECTED
        task.save(update_fields=('approved_progress', 'progress_state', 'reviewed_by', 'review_comment', 'updated_at'))
        return Response(TaskSerializer(task).data)


class TimeEntryViewSet(ModelViewSet):
    queryset = TimeEntry.objects.select_related('task__project', 'user', 'recorded_by').all()
    serializer_class = TimeEntrySerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        task = serializer.validated_data['task']
        project = task.project
        target_user = serializer.validated_data.get('user', self.request.user)
        if target_user != self.request.user and not can_log_time_for(self.request.user, project, target_user):
            raise PermissionDenied('Only the project lead or system administrator can log time for another member.')
        if target_user == self.request.user and not can_log_time(self.request.user, project):
            raise PermissionDenied('Only project members can log their own time.')
        serializer.save(user=target_user, recorded_by=self.request.user)

    def perform_update(self, serializer):
        entry = serializer.instance
        task = serializer.validated_data.get('task', entry.task)
        project = task.project
        target_user = serializer.validated_data.get('user', entry.user)
        if target_user != entry.user and not can_log_time_for(self.request.user, project, target_user):
            raise PermissionDenied('Only the project lead or system administrator can reassign this entry.')
        if entry.user != self.request.user and not can_log_time_for(self.request.user, project, entry.user):
            raise PermissionDenied('Only the project lead or system administrator can update this entry.')
        if entry.user == self.request.user and not is_system_admin(self.request.user) and not can_log_time(self.request.user, project):
            raise PermissionDenied('Only project members can update their own time entries.')
        serializer.save(recorded_by=self.request.user)

    def perform_destroy(self, instance):
        project = instance.task.project
        if instance.user != self.request.user and not can_log_time_for(self.request.user, project, instance.user):
            raise PermissionDenied('Only the project lead or system administrator can delete this entry.')
        if instance.user == self.request.user and not is_system_admin(self.request.user) and not can_log_time(self.request.user, project):
            raise PermissionDenied('Only project members can delete their own time entries.')
        instance.delete()


class WorkLogViewSet(ModelViewSet):
    serializer_class = WorkLogSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return WorkLog.objects.filter(user=self.request.user).select_related('user')

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        if project and not can_log_time(self.request.user, project):
            raise PermissionDenied('You must be a member of the selected project.')
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.user_id != self.request.user.id:
            raise PermissionDenied('You can only update your own work logs.')
        project = serializer.validated_data.get('project', serializer.instance.project)
        if project and not can_log_time(self.request.user, project):
            raise PermissionDenied('You must be a member of the selected project.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user_id != self.request.user.id:
            raise PermissionDenied('You can only delete your own work logs.')
        instance.delete()
