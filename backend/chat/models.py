import uuid

from django.conf import settings
from django.db import models


class Conversation(models.Model):
    # A draft thread belongs only to its starter until the first message.
    # This prevents merely opening a composer from creating an inbox item for
    # somebody else.
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='started_chat_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        ordering = ('-last_message_at', '-updated_at')


class ConversationParticipant(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_participations')
    last_read_at = models.DateTimeField(null=True, blank=True)
    muted_until = models.DateTimeField(null=True, blank=True)
    # Removing a conversation is personal.  It never erases another
    # participant's inbox or message history.
    hidden_at = models.DateTimeField(null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=('conversation', 'user'), name='unique_chat_participant')]
        indexes = [models.Index(fields=('user', 'conversation'))]


class ChatMessage(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_chat_messages')
    client_id = models.UUIDField(default=uuid.uuid4)
    content = models.TextField(max_length=4000)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ('-id',)
        constraints = [models.UniqueConstraint(fields=('conversation', 'sender', 'client_id'), name='unique_chat_message_client_id')]
        indexes = [models.Index(fields=('conversation', '-id'))]
