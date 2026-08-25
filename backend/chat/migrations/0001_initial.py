import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(name='Conversation', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('created_at', models.DateTimeField(auto_now_add=True)), ('updated_at', models.DateTimeField(auto_now=True)), ('last_message_at', models.DateTimeField(blank=True, db_index=True, null=True))], options={'ordering': ('-last_message_at', '-updated_at')}),
        migrations.CreateModel(name='ConversationParticipant', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('last_read_at', models.DateTimeField(blank=True, null=True)), ('muted_until', models.DateTimeField(blank=True, null=True)), ('joined_at', models.DateTimeField(auto_now_add=True)), ('conversation', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='participants', to='chat.conversation')), ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='chat_participations', to=settings.AUTH_USER_MODEL))]),
        migrations.CreateModel(name='ChatMessage', fields=[('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('client_id', models.UUIDField(default=uuid.uuid4)), ('content', models.TextField(max_length=4000)), ('created_at', models.DateTimeField(auto_now_add=True)), ('edited_at', models.DateTimeField(blank=True, null=True)), ('deleted_at', models.DateTimeField(blank=True, null=True)), ('conversation', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='messages', to='chat.conversation')), ('sender', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='sent_chat_messages', to=settings.AUTH_USER_MODEL))], options={'ordering': ('-id',)}),
        migrations.AddConstraint(model_name='conversationparticipant', constraint=models.UniqueConstraint(fields=('conversation', 'user'), name='unique_chat_participant')),
        migrations.AddIndex(model_name='conversationparticipant', index=models.Index(fields=['user', 'conversation'], name='chat_conver_user_id_6818d1_idx')),
        migrations.AddConstraint(model_name='chatmessage', constraint=models.UniqueConstraint(fields=('conversation', 'sender', 'client_id'), name='unique_chat_message_client_id')),
        migrations.AddIndex(model_name='chatmessage', index=models.Index(fields=['conversation', '-id'], name='chat_chatme_convers_662265_idx')),
    ]
