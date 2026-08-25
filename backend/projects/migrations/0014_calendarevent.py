from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0013_allow_multiple_daily_time_entries'),
    ]

    operations = [
        migrations.CreateModel(
            name='CalendarEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('event_date', models.DateField()),
                ('event_time', models.TimeField(blank=True, null=True)),
                ('color', models.CharField(choices=[('blue', 'Blue'), ('emerald', 'Emerald'), ('amber', 'Amber'), ('rose', 'Rose'), ('violet', 'Violet')], default='blue', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='calendar_events', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ('event_date', 'event_time', 'id')},
        ),
        migrations.AddIndex(
            model_name='calendarevent',
            index=models.Index(fields=['owner', 'event_date'], name='projects_ca_owner_i_f9e7f3_idx'),
        ),
    ]
