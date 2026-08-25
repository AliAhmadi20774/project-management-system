from rest_framework import serializers

from accounts.serializers import DEFAULT_AVATAR_URLS, DEFAULT_YOUNG_MAN_AVATAR_URL
from .models import ChatMessage, Conversation


def user_data(user):
    return {
        'id': user.id,
        'name': user.get_full_name() or user.username,
        'avatar_url': user.avatar.url if user.avatar else DEFAULT_AVATAR_URLS.get(user.avatar_seed, DEFAULT_YOUNG_MAN_AVATAR_URL),
    }


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    read_by_recipient = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ('id', 'client_id', 'content', 'created_at', 'edited_at', 'deleted_at', 'sender', 'read_by_recipient')
        read_only_fields = ('id', 'created_at', 'edited_at', 'deleted_at', 'sender')

    def get_sender(self, message):
        return user_data(message.sender)

    def get_read_by_recipient(self, message):
        recipient = message.conversation.participants.exclude(user_id=message.sender_id).only('last_read_at').first()
        return bool(recipient and recipient.last_read_at and message.created_at <= recipient.last_read_at)


class ConversationSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id', 'other_user', 'last_message', 'last_message_at', 'unread_count', 'created_at')

    def get_other_user(self, conversation):
        participant = next((item for item in conversation.participants.all() if item.user_id != self.context['request'].user.id), None)
        return user_data(participant.user) if participant else None

    def get_last_message(self, conversation):
        message = conversation.messages.select_related('sender').filter(deleted_at__isnull=True).first()
        return ChatMessageSerializer(message).data if message else None

    def get_unread_count(self, conversation):
        participant = next(item for item in conversation.participants.all() if item.user_id == self.context['request'].user.id)
        messages = conversation.messages.exclude(sender_id=self.context['request'].user.id).filter(deleted_at__isnull=True)
        return messages.filter(created_at__gt=participant.last_read_at).count() if participant.last_read_at else messages.count()


class StartConversationSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(min_value=1)


class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=4000, trim_whitespace=True)
    client_id = serializers.UUIDField(required=False)

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('A message cannot be empty.')
        return value
