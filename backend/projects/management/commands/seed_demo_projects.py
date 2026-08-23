from datetime import date

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from projects.models import Project, ProjectMembership, Task


DEMO_PROJECTS = (
    {
        'name': 'Mobile App Revamp',
        'description': 'Refresh the mobile experience with a shared design system.',
        'status': Project.Status.ACTIVE,
        'start_date': date(2026, 4, 1),
        'end_date': date(2026, 9, 30),
        'tasks': (
            ('Design system foundations', Task.Status.DONE, 100, 30),
            ('Core screen implementation', Task.Status.IN_PROGRESS, 78, 45),
            ('Release preparation', Task.Status.TODO, 0, 25),
        ),
    },
    {
        'name': 'Billing Platform v2',
        'description': 'Deliver metered billing and a refreshed invoice workflow.',
        'status': Project.Status.ON_HOLD,
        'start_date': date(2026, 3, 15),
        'end_date': date(2026, 10, 31),
        'tasks': (
            ('Usage data model', Task.Status.DONE, 100, 30),
            ('Invoice generation', Task.Status.IN_PROGRESS, 46, 45),
            ('Payment reconciliation', Task.Status.TODO, 0, 25),
        ),
    },
    {
        'name': 'Website Redesign',
        'description': 'Modernize the marketing website and improve conversion paths.',
        'status': Project.Status.ACTIVE,
        'start_date': date(2026, 5, 1),
        'end_date': date(2026, 8, 31),
        'tasks': (
            ('Content audit', Task.Status.DONE, 100, 30),
            ('Page templates', Task.Status.IN_PROGRESS, 63, 45),
            ('Analytics validation', Task.Status.TODO, 0, 25),
        ),
    },
    {
        'name': 'Data Warehouse',
        'description': 'Create a reliable foundation for reporting and analytics.',
        'status': Project.Status.ON_HOLD,
        'start_date': date(2026, 2, 1),
        'end_date': date(2026, 11, 30),
        'tasks': (
            ('Source inventory', Task.Status.DONE, 100, 30),
            ('Warehouse pipelines', Task.Status.IN_PROGRESS, 31, 45),
            ('Reporting rollout', Task.Status.TODO, 0, 25),
        ),
    },
    {
        'name': 'Onboarding Overhaul',
        'description': 'Make the first weeks for new employees clearer and more consistent.',
        'status': Project.Status.ACTIVE,
        'start_date': date(2026, 6, 1),
        'end_date': date(2026, 9, 15),
        'tasks': (
            ('Employee journey mapping', Task.Status.DONE, 100, 30),
            ('Onboarding checklist', Task.Status.IN_PROGRESS, 69, 45),
            ('Manager enablement', Task.Status.TODO, 0, 25),
        ),
    },
    {
        'name': 'SOC 2 Compliance',
        'description': 'Prepare policies, controls, and evidence for SOC 2 readiness.',
        'status': Project.Status.COMPLETED,
        'start_date': date(2026, 1, 1),
        'end_date': date(2026, 6, 30),
        'tasks': (
            ('Control assessment', Task.Status.DONE, 100, 30),
            ('Evidence collection', Task.Status.DONE, 100, 45),
            ('Readiness review', Task.Status.DONE, 100, 25),
        ),
    },
)


class Command(BaseCommand):
    help = 'Create the ProjectHub demonstration projects and their tasks.'

    def add_arguments(self, parser):
        parser.add_argument('--username', help='Personnel number of the project owner.')

    def handle(self, *args, **options):
        user_model = get_user_model()
        username = options.get('username')
        if username:
            owner = user_model.objects.filter(username=username).first()
        else:
            owner = user_model.objects.filter(is_superuser=True).first() or user_model.objects.filter(is_staff=True).first()
        if not owner:
            raise CommandError('Create a system administrator first, or provide an existing --username.')

        created_count = 0
        for data in DEMO_PROJECTS:
            tasks = data['tasks']
            project, created = Project.objects.get_or_create(
                name=data['name'],
                defaults={key: value for key, value in data.items() if key != 'tasks'} | {'created_by': owner},
            )
            ProjectMembership.objects.get_or_create(
                project=project,
                user=owner,
                role=ProjectMembership.Role.MANAGER,
            )
            if created:
                created_count += 1
                for title, status, progress, weight in tasks:
                    Task.objects.create(
                        project=project,
                        title=title,
                        status=status,
                        assignee=owner,
                        approved_progress=progress,
                        progress_state=Task.ProgressState.APPROVED,
                        weight=weight,
                    )

        self.stdout.write(self.style.SUCCESS(
            f'Demo projects are ready. Created {created_count}; {len(DEMO_PROJECTS) - created_count} already existed.'
        ))
