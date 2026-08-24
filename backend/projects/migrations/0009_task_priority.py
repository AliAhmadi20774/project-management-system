import random

from django.db import migrations, models


def assign_existing_task_priorities(apps, schema_editor):
    Task = apps.get_model('projects', 'Task')
    priorities = ('low', 'medium', 'high', 'urgent')
    for task in Task.objects.all().iterator():
        task.priority = random.choice(priorities)
        task.save(update_fields=('priority',))


class Migration(migrations.Migration):
    dependencies = [('projects', '0008_remove_project_manager_memberships')]

    operations = [
        migrations.AddField(
            model_name='task',
            name='priority',
            field=models.CharField(
                choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')],
                default='medium',
                max_length=20,
            ),
        ),
        migrations.RunPython(assign_existing_task_priorities, migrations.RunPython.noop),
    ]
