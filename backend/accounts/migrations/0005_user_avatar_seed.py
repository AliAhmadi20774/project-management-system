from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('accounts', '0004_user_avatar')]

    operations = [
        migrations.AddField(
            model_name='user',
            name='avatar_seed',
            field=models.CharField(default='8', max_length=20, verbose_name='default avatar'),
        ),
    ]
