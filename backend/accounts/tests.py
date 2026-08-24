from django.test import TestCase
from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.test import APITestCase

from organizations.models import Department

from .models import User
from projects.permissions import PROJECT_MANAGER_GROUP


class UserModelTests(TestCase):
    def test_personnel_number_is_the_username(self):
        department = Department.objects.create(name='Information Technology', code='IT')
        user = User.objects.create_user(
            username='001245',
            password='a-secure-password',
            first_name='Ali',
            last_name='Ahmadi',
            email='ali@example.com',
            department=department,
        )

        self.assertEqual(user.username, '001245')
        self.assertEqual(user.department, department)


class AccountApiTests(APITestCase):
    def setUp(self):
        self.department = Department.objects.create(name='Information Technology', code='IT')
        self.user = User.objects.create_user(
            username='001245',
            password='a-secure-password',
            first_name='Ali',
            last_name='Ahmadi',
            email='ali@example.com',
            department=self.department,
        )

    def test_user_can_obtain_a_token_and_read_own_profile(self):
        token_response = self.client.post(
            '/api/v1/auth/token/',
            {'username': '001245', 'password': 'a-secure-password'},
            format='json',
        )

        self.assertEqual(token_response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}")
        profile_response = self.client.get('/api/v1/accounts/users/me/')

        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['username'], '001245')
        self.assertEqual(profile_response.data['department_detail']['code'], 'IT')

    def test_staff_user_can_list_users(self):
        admin = User.objects.create_superuser(
            username='000001',
            password='a-secure-password',
            email='admin@example.com',
        )
        self.client.force_authenticate(admin)

        response = self.client.get('/api/v1/accounts/users/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['username'], '001245')

    def test_staff_user_can_create_user_with_short_password(self):
        admin = User.objects.create_superuser(
            username='000001',
            password='a-secure-password',
            email='admin@example.com',
        )
        self.client.force_authenticate(admin)

        response = self.client.post(
            '/api/v1/accounts/users/',
            {
                'username': '456',
                'first_name': 'Akbar',
                'last_name': 'Rahimi',
                'email': 'akbar@example.com',
                'password': '123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.get(username='456').check_password('123'))

    def test_system_admin_can_create_user_without_email(self):
        admin = User.objects.create_superuser(username='000001', password='pass', email='admin@example.com')
        self.client.force_authenticate(admin)

        response = self.client.post(
            '/api/v1/accounts/users/',
            {'username': '455', 'first_name': 'No', 'last_name': 'Email', 'email': '', 'password': '123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(User.objects.get(username='455').email)

    def test_new_user_has_the_fixed_default_ui_avatar(self):
        admin = User.objects.create_superuser(username='000001', password='pass', email='admin@example.com')
        self.client.force_authenticate(admin)

        response = self.client.post(
            '/api/v1/accounts/users/',
            {'username': '454', 'first_name': 'Avatar', 'last_name': 'Default', 'password': '123'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(username='454').avatar_seed, 'young-man')
        self.assertEqual('/avatars/default-young-man.png', response.data['avatar_url'])

    def test_system_admin_can_create_a_project_manager(self):
        admin = User.objects.create_superuser(username='000001', password='pass', email='admin@example.com')
        self.client.force_authenticate(admin)

        response = self.client.post(
            '/api/v1/accounts/users/',
            {
                'username': '457', 'first_name': 'Project', 'last_name': 'Manager',
                'email': 'manager@example.com', 'password': '123', 'access_role': 'manager',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        manager = User.objects.get(username='457')
        self.assertTrue(manager.groups.filter(name=PROJECT_MANAGER_GROUP).exists())
        self.assertEqual(response.data['access_role'], 'manager')

    def test_system_admin_can_create_another_system_admin(self):
        admin = User.objects.create_superuser(username='000001', password='pass', email='admin@example.com')
        self.client.force_authenticate(admin)

        response = self.client.post(
            '/api/v1/accounts/users/',
            {
                'username': '459', 'first_name': 'System', 'last_name': 'Admin',
                'email': 'system-admin@example.com', 'password': '123', 'access_role': 'system_admin',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        system_admin = User.objects.get(username='459')
        self.assertTrue(system_admin.is_staff)
        self.assertTrue(system_admin.is_superuser)
        self.assertEqual(response.data['access_role'], 'system_admin')

    def test_non_system_staff_cannot_create_a_project_manager(self):
        staff = User.objects.create_user(username='000002', password='pass', email='staff@example.com', is_staff=True)
        self.client.force_authenticate(staff)

        response = self.client.post(
            '/api/v1/accounts/users/',
            {
                'username': '458', 'first_name': 'Denied', 'last_name': 'Manager',
                'email': 'denied@example.com', 'password': '123', 'access_role': 'manager',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_project_manager_can_create_only_an_ordinary_user(self):
        manager = User.objects.create_user(username='000003', password='pass', email='manager@example.com')
        group, _ = Group.objects.get_or_create(name=PROJECT_MANAGER_GROUP)
        manager.groups.add(group)
        self.client.force_authenticate(manager)

        ordinary = self.client.post(
            '/api/v1/accounts/users/',
            {
                'username': '460', 'first_name': 'Ordinary', 'last_name': 'User',
                'email': 'ordinary@example.com', 'password': '123', 'access_role': 'user',
            },
            format='json',
        )
        self.assertEqual(ordinary.status_code, status.HTTP_201_CREATED)

        elevated = self.client.post(
            '/api/v1/accounts/users/',
            {
                'username': '461', 'first_name': 'Elevated', 'last_name': 'User',
                'email': 'elevated@example.com', 'password': '123', 'access_role': 'system_admin',
            },
            format='json',
        )
        self.assertEqual(elevated.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('access_role', elevated.data)
