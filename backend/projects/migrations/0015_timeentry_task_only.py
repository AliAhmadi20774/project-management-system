from django.db import migrations, models
import django.db.models.deletion


def remove_existing_time_entries(apps, schema_editor):
    apps.get_model('projects', 'TimeEntry').objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [('projects', '0014_calendarevent')]

    operations = [
        migrations.RunPython(remove_existing_time_entries, migrations.RunPython.noop),
        migrations.AddField(model_name='timeentry', name='task', field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='time_entries', to='projects.task')),
        migrations.RemoveField(model_name='timeentry', name='project'),
        migrations.AlterField(model_name='timeentry', name='task', field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='time_entries', to='projects.task')),
    ]
