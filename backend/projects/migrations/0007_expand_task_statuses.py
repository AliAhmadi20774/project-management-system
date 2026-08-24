from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('projects', '0006_task_assignee_optional'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='status',
            field=models.CharField(
                choices=[
                    ('backlog', 'Backlog'),
                    ('todo', 'To do'),
                    ('in_progress', 'In progress'),
                    ('in_review', 'In review'),
                    ('done', 'Done'),
                ],
                default='todo',
                max_length=20,
            ),
        ),
    ]
