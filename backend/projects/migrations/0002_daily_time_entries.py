import django.core.validators
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='timeentry',
            name='ended_at',
        ),
        migrations.RemoveField(
            model_name='timeentry',
            name='notes',
        ),
        migrations.RemoveField(
            model_name='timeentry',
            name='started_at',
        ),
        migrations.AddField(
            model_name='timeentry',
            name='duration_minutes',
            field=models.PositiveIntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)]),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='timeentry',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='timeentry',
            name='work_date',
            field=models.DateField(default=django.utils.timezone.localdate),
        ),
        migrations.AlterModelOptions(
            name='timeentry',
            options={'ordering': ('-work_date',)},
        ),
        migrations.AddConstraint(
            model_name='timeentry',
            constraint=models.UniqueConstraint(fields=('project', 'user', 'work_date'), name='unique_daily_project_time_entry'),
        ),
    ]
