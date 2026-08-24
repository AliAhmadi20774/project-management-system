from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('accounts', '0003_user_email_optional')]

    operations = [
        migrations.AddField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='user_avatars/', verbose_name='profile image'),
        ),
    ]
