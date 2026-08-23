from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand

from accounts.models import User
from organizations.models import Department
from projects.models import Project, ProjectMembership
from projects.permissions import PROJECT_MANAGER_GROUP


DEMO_USERS = (
    ('1001', 'Alex', 'Morgan', 'alex.morgan@projecthub.local', 'Head of Product', 'Product', 'PRD'),
    ('1002', 'Sofia', 'Rossi', 'sofia.rossi@projecthub.local', 'Head of Growth', 'Marketing', 'MKT'),
    ('1003', 'Marcus', 'Chen', 'marcus.chen@projecthub.local', 'Staff Engineer', 'Engineering', 'ENG'),
    ('1004', 'Priya', 'Nair', 'priya.nair@projecthub.local', 'Product Designer', 'Design', 'DSN'),
    ('1005', 'Daniel', 'Weber', 'daniel.weber@projecthub.local', 'Backend Engineer', 'Engineering', 'ENG'),
    ('1006', 'Hannah', 'Kim', 'hannah.kim@projecthub.local', 'Customer Success Lead', 'Success', 'CS'),
    ('1007', 'Lucas', 'Silva', 'lucas.silva@projecthub.local', 'Data Analyst', 'Data', 'DAT'),
    ('1008', 'Emma', 'Novak', 'emma.novak@projecthub.local', 'Frontend Engineer', 'Engineering', 'ENG'),
    ('1009', 'Omar', 'Haddad', 'omar.haddad@projecthub.local', 'DevOps Engineer', 'Engineering', 'ENG'),
    ('1010', 'Chloe', 'Dubois', 'chloe.dubois@projecthub.local', 'Content Strategist', 'Marketing', 'MKT'),
)

TEAM_PATTERNS = (
    (0, 2, 3, (4, 7, 8)),
    (1, 4, 9, (2, 5, 6)),
    (0, 7, 3, (2, 4, 9)),
    (6, 8, 2, (0, 4, 7)),
    (5, 3, 1, (0, 6, 9)),
    (9, 8, 5, (1, 4, 6)),
)


class Command(BaseCommand):
    help = 'Create the ProjectHub demonstration users, departments, and project roles.'

    def handle(self, *args, **options):
        users = []
        created_count = 0
        for username, first_name, last_name, email, job_title, department_name, department_code in DEMO_USERS:
            department, _ = Department.objects.get_or_create(
                code=department_code,
                defaults={'name': department_name},
            )
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': email,
                    'job_title': job_title,
                    'department': department,
                    'is_active': True,
                },
            )
            if created:
                user.set_password('demo')
                user.save(update_fields=('password',))
                created_count += 1
            users.append(user)

        manager_group, _ = Group.objects.get_or_create(name=PROJECT_MANAGER_GROUP)
        users[0].groups.add(manager_group)

        for index, project in enumerate(Project.objects.order_by('id')):
            manager_index, lead_index, observer_index, member_indexes = TEAM_PATTERNS[index % len(TEAM_PATTERNS)]
            ProjectMembership.objects.filter(project=project, user__in=users).delete()
            ProjectMembership.objects.create(project=project, user=users[manager_index], role=ProjectMembership.Role.MANAGER)
            ProjectMembership.objects.create(project=project, user=users[lead_index], role=ProjectMembership.Role.LEAD)
            ProjectMembership.objects.create(project=project, user=users[observer_index], role=ProjectMembership.Role.OBSERVER)
            for member_index in member_indexes:
                ProjectMembership.objects.create(project=project, user=users[member_index], role=ProjectMembership.Role.MEMBER)

        self.stdout.write(self.style.SUCCESS(
            f'Demo users are ready. Created {created_count}; {len(DEMO_USERS) - created_count} already existed.'
        ))
