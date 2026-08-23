from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User

from .models import Project, ProjectMembership, Task, TimeEntry
from .permissions import PROJECT_MANAGER_GROUP


class ProjectRoleApiTests(APITestCase):
    def setUp(self):
        self.manager = User.objects.create_user(username='100', email='manager@example.com', password='pass')
        self.lead = User.objects.create_user(username='101', email='lead@example.com', password='pass')
        self.observer = User.objects.create_user(username='102', email='observer@example.com', password='pass')
        self.member = User.objects.create_user(username='103', email='member@example.com', password='pass')
        self.viewer = User.objects.create_user(username='104', email='viewer@example.com', password='pass')
        group, _ = Group.objects.get_or_create(name=PROJECT_MANAGER_GROUP)
        self.manager.groups.add(group)

        self.client.force_authenticate(self.manager)
        response = self.client.post('/api/v1/projects/', {'name': 'Website refresh'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.project = Project.objects.get(pk=response.data['id'])

        ProjectMembership.objects.create(project=self.project, user=self.lead, role=ProjectMembership.Role.LEAD)
        ProjectMembership.objects.create(project=self.project, user=self.observer, role=ProjectMembership.Role.OBSERVER)
        ProjectMembership.objects.create(project=self.project, user=self.member, role=ProjectMembership.Role.MEMBER)

    def test_all_authenticated_users_can_view_projects(self):
        self.client.force_authenticate(self.viewer)

        response = self.client.get('/api/v1/projects/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['id'], self.project.id)

    def test_lead_submits_and_observer_approves_progress(self):
        task = Task.objects.create(project=self.project, title='Build dashboard', assignee=self.lead)
        self.client.force_authenticate(self.lead)

        submitted = self.client.post(f'/api/v1/tasks/{task.id}/submit-progress/', {'progress': 65}, format='json')

        self.assertEqual(submitted.status_code, status.HTTP_200_OK)
        self.assertEqual(submitted.data['progress_state'], Task.ProgressState.PENDING_REVIEW)
        self.client.force_authenticate(self.observer)
        reviewed = self.client.post(f'/api/v1/tasks/{task.id}/review-progress/', {'approved': True}, format='json')

        self.assertEqual(reviewed.status_code, status.HTTP_200_OK)
        self.assertEqual(reviewed.data['approved_progress'], 65)
        self.assertEqual(reviewed.data['progress_state'], Task.ProgressState.APPROVED)

    def test_lead_can_create_and_assign_tasks(self):
        self.client.force_authenticate(self.lead)

        created = self.client.post(
            '/api/v1/tasks/',
            {
                'project': self.project.id,
                'title': 'Prepare launch plan',
                'assignee': self.member.id,
                'start_date': '2026-08-25',
                'end_date': '2026-08-30',
            },
            format='json',
        )

        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data['assignee'], self.member.id)

        self.client.force_authenticate(self.observer)
        forbidden = self.client.post(
            '/api/v1/tasks/',
            {
                'project': self.project.id,
                'title': 'Unauthorized',
                'assignee': self.member.id,
            },
            format='json',
        )
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

    def test_task_weights_cannot_exceed_100_and_project_progress_is_weighted(self):
        self.client.force_authenticate(self.lead)
        first = self.client.post(
            '/api/v1/tasks/',
            {
                'project': self.project.id,
                'title': 'Foundation',
                'weight': 40,
                'initial_progress': 65,
                'assignee': self.member.id,
            },
            format='json',
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(first.data['reported_progress'], 65)
        self.assertEqual(first.data['progress_state'], Task.ProgressState.PENDING_REVIEW)

        second = self.client.post(
            '/api/v1/tasks/',
            {
                'project': self.project.id,
                'title': 'Over allocation',
                'weight': 61,
                'assignee': self.member.id,
            },
            format='json',
        )
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('weight', second.data)

        task = Task.objects.get(pk=first.data['id'])
        task.approved_progress = 65
        task.progress_state = Task.ProgressState.APPROVED
        task.save(update_fields=('approved_progress', 'progress_state'))

        self.client.force_authenticate(self.manager)
        project = self.client.get(f'/api/v1/projects/{self.project.id}/')
        self.assertEqual(project.status_code, status.HTTP_200_OK)
        self.assertEqual(project.data['progress'], 26)

    def test_member_can_log_one_daily_duration_but_observer_cannot(self):
        self.client.force_authenticate(self.member)
        response = self.client.post(
            '/api/v1/time-entries/',
            {'project': self.project.id, 'work_date': '2026-08-23', 'duration_minutes': 150},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        entry = TimeEntry.objects.get(pk=response.data['id'])
        self.assertEqual(entry.work_date.isoformat(), '2026-08-23')
        self.assertEqual(entry.duration_minutes, 150)

        duplicate = self.client.post(
            '/api/v1/time-entries/',
            {'project': self.project.id, 'work_date': '2026-08-23', 'duration_minutes': 60},
            format='json',
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

        self.client.force_authenticate(self.observer)
        forbidden = self.client.post(
            '/api/v1/time-entries/',
            {'project': self.project.id, 'work_date': '2026-08-23', 'duration_minutes': 60},
            format='json',
        )

        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)
