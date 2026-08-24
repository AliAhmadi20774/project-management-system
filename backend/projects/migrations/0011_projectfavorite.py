from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0010_project_code_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectFavorite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorites', to='projects.project')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorite_projects', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ('-created_at',)},
        ),
        migrations.AddConstraint(
            model_name='projectfavorite',
            constraint=models.UniqueConstraint(fields=('project', 'user'), name='unique_project_favorite'),
        ),
    ]
