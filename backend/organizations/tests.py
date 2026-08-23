from django.test import TestCase

from .models import Department


class DepartmentModelTests(TestCase):
    def test_string_representation_uses_code_and_name(self):
        department = Department.objects.create(name='Information Technology', code='IT')

        self.assertEqual(str(department), 'IT — Information Technology')
