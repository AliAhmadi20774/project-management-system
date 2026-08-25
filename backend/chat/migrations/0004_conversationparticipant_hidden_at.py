from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('chat', '0003_merge_duplicate_direct_conversations')]

    operations = [
        migrations.AddField(
            model_name='conversationparticipant',
            name='hidden_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
