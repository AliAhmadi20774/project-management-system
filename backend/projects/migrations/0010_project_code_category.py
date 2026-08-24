from django.db import migrations, models


def populate_project_metadata(apps, schema_editor):
    Project = apps.get_model('projects', 'Project')
    metadata = {
        'Mobile App Revamp': ('MOB', 'Product'),
        'Billing Platform v2': ('BILL', 'Engineering'),
        'Website Redesign': ('WEB', 'Marketing'),
        'Data Warehouse': ('DATA', 'Data'),
        'Onboarding Overhaul': ('ONB', 'Product'),
        'SOC 2 Compliance': ('SEC', 'Security'),
    }
    for project in Project.objects.all().iterator():
        code, category = metadata.get(project.name, (f'PRJ{project.pk}', 'General'))
        project.code = code
        project.category = category
        project.save(update_fields=('code', 'category'))


class Migration(migrations.Migration):
    dependencies = [('projects', '0009_task_priority')]

    operations = [
        migrations.AddField(model_name='project', name='code', field=models.CharField(max_length=12, null=True, unique=True)),
        migrations.AddField(model_name='project', name='category', field=models.CharField(default='General', max_length=100)),
        migrations.RunPython(populate_project_metadata, migrations.RunPython.noop),
        migrations.AlterField(model_name='project', name='code', field=models.CharField(max_length=12, unique=True)),
    ]
