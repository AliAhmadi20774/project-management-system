from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Project, ProjectMembership, Task, TimeEntry
from .permissions import can_create_projects, can_log_time, can_manage_project, can_manage_tasks, can_review_progress, can_submit_progress, is_system_admin
from .serializers import ProgressReviewSerializer, ProgressSubmissionSerializer, ProjectMembershipSerializer, ProjectSerializer, TaskSerializer, TimeEntrySerializer


class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.select_related('created_by').all()
    serializer_class = ProjectSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        if not can_create_projects(self.request.user):
            raise PermissionDenied('Only system administrators and project managers can create projects.')
        project = serializer.save(created_by=self.request.user)
        ProjectMembership.objects.get_or_create(project=project, user=self.request.user, role=ProjectMembership.Role.MANAGER)

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
        if not can_manage_project(self.request.user, instance.project):
            raise PermissionDenied('Only the project manager can remove project roles.')
        instance.delete()


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
        task.reported_progress = serializer.validated_data['progress']
        task.reported_by = request.user
        task.progress_state = Task.ProgressState.PENDING_REVIEW
        task.review_comment = ''
        task.save(update_fields=('reported_progress', 'reported_by', 'progress_state', 'review_comment', 'updated_at'))
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
        managed_project_ids = ProjectMembership.objects.filter(user=user, role=ProjectMembership.Role.MANAGER).values('project_id')
        return self.queryset.filter(Q(user=user) | Q(project_id__in=managed_project_ids)).distinct()

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
