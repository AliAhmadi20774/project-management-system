from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('notes', '0001_initial')]

    operations = [
        migrations.AddField(
            model_name='personalnote',
            name='content',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
