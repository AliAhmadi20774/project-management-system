from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name='PersonalNote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=200)),
                ('body', models.TextField(blank=True)),
                ('folder', models.CharField(choices=[('work', 'Work'), ('personal', 'Personal'), ('ideas', 'Ideas'), ('archive', 'Archive')], default='work', max_length=16)),
                ('color', models.CharField(choices=[('blue', 'Blue'), ('violet', 'Violet'), ('emerald', 'Green'), ('amber', 'Amber'), ('rose', 'Rose'), ('slate', 'Slate')], default='blue', max_length=16)),
                ('tags', models.JSONField(blank=True, default=list)),
                ('is_pinned', models.BooleanField(default=False)),
                ('is_archived', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='personal_notes', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ('-is_pinned', '-updated_at')},
        ),
    ]
