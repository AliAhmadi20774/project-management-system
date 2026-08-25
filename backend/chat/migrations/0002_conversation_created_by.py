from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('chat', '0001_initial')]

    operations = [
        migrations.AddField(
            model_name='conversation',
            name='created_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.SET_NULL, related_name='started_chat_conversations', to=settings.AUTH_USER_MODEL),
        ),
    ]
