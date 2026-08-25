from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User

from .models import CalendarEvent, Project, ProjectMembership, Task, TimeEntry
from .permissions import PROJECT_MANAGER_GROUP


class ProjectRoleApiTests(APITestCase):
    def setUp(self):
        self.manager = User.objects.create_user(username='100', email='manager@example.com', password='pass')
        self.lead = User.objects.create_user(username='101', email='lead@example.com', password='pass')
        self.observer = User.objects.create_user(username='102', email='observer@example.com', password='pass')
        self.member = User.objects.create_user(username='103', email='member@example.com', password='pass')
        self.viewer = User.objects.create_user(username='104', email='viewer@example.com', password='pass')
        self.admin = User.objects.create_superuser(username='105', email='admin@example.com', password='pass')
        group, _ = Group.objects.get_or_create(name=PROJECT_MANAGER_GROUP)
        self.manager.groups.add(group)

        self.client.force_authenticate(self.manager)
        response = self.client.post('/api/v1/projects/', {'name': 'Website refresh', 'code': 'WREF'}, format='json')
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

    def test_users_can_manage_only_their_own_calendar_events(self):
        self.client.force_authenticate(self.member)
        created = self.client.post(
            '/api/v1/calendar-events/',
            {'title': 'Sprint planning', 'event_date': '2026-08-25', 'event_time': '09:30', 'color': 'blue'},
            format='json',
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data['event_time'], '09:30:00')

        self.client.force_authenticate(self.viewer)
        self.assertEqual(self.client.get('/api/v1/calendar-events/').data, [])
        self.assertEqual(self.client.patch(f"/api/v1/calendar-events/{created.data['id']}/", {'title': 'Nope'}, format='json').status_code, status.HTTP_404_NOT_FOUND)

    def test_calendar_events_can_be_filtered_by_date_range(self):
        CalendarEvent.objects.create(owner=self.member, title='August', event_date='2026-08-25')
        CalendarEvent.objects.create(owner=self.member, title='September', event_date='2026-09-01')
        self.client.force_authenticate(self.member)

        response = self.client.get('/api/v1/calendar-events/?start=2026-08-01&end=2026-08-31')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([event['title'] for event in response.data], ['August'])

    def test_only_global_manager_or_admin_can_manage_members(self):
        task = Task.objects.create(project=self.project, title='Assigned work', assignee=self.lead)
        lead_membership = ProjectMembership.objects.get(project=self.project, user=self.lead)
        observer_membership = ProjectMembership.objects.get(project=self.project, user=self.observer)

        # A lead is a project role, not a project administrator.
        self.client.force_authenticate(self.lead)
        forbidden = self.client.delete(f'/api/v1/project-memberships/{observer_membership.id}/')
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # A global project manager can remove any project person. Removing the
        # lead does not delete the project and leaves assigned work unassigned.
        self.client.force_authenticate(self.manager)
        removed = self.client.delete(f'/api/v1/project-memberships/{lead_membership.id}/')
        self.assertEqual(removed.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ProjectMembership.objects.filter(project=self.project, user=self.lead).exists())
        task.refresh_from_db()
        self.assertIsNone(task.assignee)
        self.assertTrue(Project.objects.filter(pk=self.project.pk).exists())

        # The project is still valid even when all special roles are gone.
        removed_observer = self.client.delete(f'/api/v1/project-memberships/{observer_membership.id}/')
        self.assertEqual(removed_observer.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(Project.objects.filter(pk=self.project.pk).exists())

    def test_project_creation_does_not_create_a_manager_membership(self):
        self.assertFalse(
            ProjectMembership.objects.filter(
                project=self.project,
                user=self.manager,
                role='manager',
            ).exists()
        )

    def test_global_manager_can_list_candidates_and_add_a_member(self):
        self.client.force_authenticate(self.manager)
        candidates = self.client.get(f'/api/v1/project-memberships/candidates/?project={self.project.id}')
        self.assertEqual(candidates.status_code, status.HTTP_200_OK)
        self.assertIn(self.viewer.id, [item['id'] for item in candidates.data])

        added = self.client.post(
            '/api/v1/project-memberships/',
            {'project': self.project.id, 'user': self.viewer.id, 'role': ProjectMembership.Role.MEMBER},
            format='json',
        )
        self.assertEqual(added.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ProjectMembership.objects.filter(project=self.project, user=self.viewer).exists())

    def test_global_manager_can_change_member_role_without_unassigning_tasks(self):
        task = Task.objects.create(project=self.project, title='Keep assignment', assignee=self.member)
        membership = ProjectMembership.objects.get(project=self.project, user=self.member)
        self.client.force_authenticate(self.manager)

        updated = self.client.patch(
            f'/api/v1/project-memberships/{membership.id}/',
            {'role': ProjectMembership.Role.LEAD},
            format='json',
        )

        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data['role'], ProjectMembership.Role.LEAD)
        task.refresh_from_db()
        self.assertEqual(task.assignee, self.member)

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

    def test_system_admin_updates_and_approves_progress_directly(self):
        task = Task.objects.create(project=self.project, title='Admin override', weight=25)
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            f'/api/v1/tasks/{task.id}/submit-progress/',
            {'progress': 72},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reported_progress'], 72)
        self.assertEqual(response.data['approved_progress'], 72)
        self.assertEqual(response.data['progress_state'], Task.ProgressState.APPROVED)
        task.refresh_from_db()
        self.assertEqual(task.reported_by, self.admin)
        self.assertEqual(task.reviewed_by, self.admin)

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

        updated = self.client.patch(
            f"/api/v1/tasks/{created.data['id']}/",
            {
                'title': 'Prepare reviewed launch plan',
                'status': Task.Status.IN_REVIEW,
                'assignee': self.lead.id,
                'start_date': '2026-08-26',
                'end_date': '2026-09-01',
            },
            format='json',
        )
        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data['title'], 'Prepare reviewed launch plan')
        self.assertEqual(updated.data['status'], Task.Status.IN_REVIEW)
        self.assertEqual(updated.data['assignee'], self.lead.id)
        self.assertEqual(updated.data['start_date'], '2026-08-26')
        self.assertEqual(updated.data['end_date'], '2026-09-01')

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
        self.assertEqual(project.data['progress'], 65.0)

    def test_project_participants_can_log_multiple_entries_on_one_day(self):
        task = Task.objects.create(project=self.project, title='Build the landing page', weight=10)
        self.client.force_authenticate(self.member)
        response = self.client.post(
            '/api/v1/time-entries/',
            {'task': task.id, 'work_date': '2026-08-23', 'duration_minutes': 150},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        entry = TimeEntry.objects.get(pk=response.data['id'])
        self.assertEqual(entry.task, task)
        self.assertEqual(entry.work_date.isoformat(), '2026-08-23')
        self.assertEqual(entry.duration_minutes, 150)

        second_entry = self.client.post(
            '/api/v1/time-entries/',
            {'task': task.id, 'work_date': '2026-08-23', 'duration_minutes': 60},
            format='json',
        )
        self.assertEqual(second_entry.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            TimeEntry.objects.filter(
                task=task,
                user=self.member,
                work_date='2026-08-23',
            ).count(),
            2,
        )

        self.client.force_authenticate(self.observer)
        observer_entry = self.client.post(
            '/api/v1/time-entries/',
            {'task': task.id, 'work_date': '2026-08-23', 'duration_minutes': 60},
            format='json',
        )

        self.assertEqual(observer_entry.status_code, status.HTTP_201_CREATED)

        self.client.force_authenticate(self.viewer)
        forbidden = self.client.post(
            '/api/v1/time-entries/',
            {'task': task.id, 'work_date': '2026-08-23', 'duration_minutes': 30},
            format='json',
        )
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)
