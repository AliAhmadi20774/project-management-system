from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from organizations.models import Department

from .models import User


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
