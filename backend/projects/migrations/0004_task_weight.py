from django.db import migrations, models
from django.core.validators import MaxValueValidator, MinValueValidator


def distribute_existing_task_weights(apps, schema_editor):
    Task = apps.get_model('projects', 'Task')
    Project = apps.get_model('projects', 'Project')

    for project in Project.objects.all():
        tasks = list(Task.objects.filter(project=project).order_by('id'))
        if not tasks:
            continue
        base_weight, remainder = divmod(100, len(tasks))
        for index, task in enumerate(tasks):
            task.weight = base_weight + (1 if index < remainder else 0)
            task.save(update_fields=('weight',))


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0003_task_end_date_task_start_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='weight',
            field=models.PositiveSmallIntegerField(
                default=1,
                help_text='Contribution of this task to its project, expressed as a percentage.',
                validators=[MinValueValidator(1), MaxValueValidator(100)],
            ),
        ),
        migrations.RunPython(distribute_existing_task_weights, migrations.RunPython.noop),
    ]
