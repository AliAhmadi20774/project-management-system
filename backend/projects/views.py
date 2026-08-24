from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Project, ProjectMembership, Task, TimeEntry
from .permissions import can_create_projects, can_log_time, can_manage_project, can_manage_project_members, can_manage_tasks, can_review_progress, can_submit_progress, is_system_admin
from .serializers import ProgressReviewSerializer, ProgressSubmissionSerializer, ProjectMembershipSerializer, ProjectSerializer, TaskSerializer, TimeEntrySerializer


class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.select_related('created_by').all()
    serializer_class = ProjectSerializer
    permission_classes = (IsAuthenticated,)

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
    queryset = Task.objects.select_related('project', 'assignee', 'reported_by', 'reviewed_by').all()
    serializer_class = TaskSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super().get_queryset()
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
    queryset = TimeEntry.objects.select_related('project', 'user').all()
    serializer_class = TimeEntrySerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if is_system_admin(user):
            return self.queryset
        return self.queryset.filter(user=user)

    def perform_create(self, serializer):
        project = serializer.validated_data['project']
        if not can_log_time(self.request.user, project):
            raise PermissionDenied('Only project team members can log time.')
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        entry = serializer.instance
        if entry.user != self.request.user and not is_system_admin(self.request.user):
            raise PermissionDenied('You can only update your own time entries.')
        if not is_system_admin(self.request.user) and not can_log_time(self.request.user, entry.project):
            raise PermissionDenied('Only project team members can update time entries.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user and not is_system_admin(self.request.user):
            raise PermissionDenied('You can only delete your own time entries.')
        if not is_system_admin(self.request.user) and not can_log_time(self.request.user, instance.project):
            raise PermissionDenied('Only project team members can delete time entries.')
        instance.delete()
