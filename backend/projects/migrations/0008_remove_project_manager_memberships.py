from django.db import migrations, models


def remove_legacy_manager_memberships(apps, schema_editor):
    ProjectMembership = apps.get_model('projects', 'ProjectMembership')
    Task = apps.get_model('projects', 'Task')

    legacy_memberships = ProjectMembership.objects.filter(role='manager')
    for membership in legacy_memberships.iterator():
        Task.objects.filter(project_id=membership.project_id, assignee_id=membership.user_id).update(assignee=None)
    legacy_memberships.delete()


class Migration(migrations.Migration):
    dependencies = [
        ('projects', '0007_expand_task_statuses'),
    ]

    operations = [
        migrations.RunPython(remove_legacy_manager_memberships, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='projectmembership',
            name='role',
            field=models.CharField(choices=[
                ('lead', 'Project lead'),
                ('observer', 'Project observer'),
                ('member', 'Team member'),
            ], max_length=20),
        ),
    ]
