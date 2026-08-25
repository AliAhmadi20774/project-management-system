import os
import time
import uuid
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone
from redis.asyncio import Redis
from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import User
from .models import ChatMessage, Conversation, ConversationParticipant
from .serializers import ChatMessageSerializer


# Presence is ephemeral: each browser tab refreshes its entry and stale tabs
# expire automatically, so a crash cannot leave a user marked as online.
presence_redis = Redis.from_url(os.environ.get('REDIS_URL', 'redis://redis:6379/0'), decode_responses=True)
PRESENCE_TTL_SECONDS = 75


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        ticket = parse_qs(self.scope['query_string'].decode()).get('ticket', [''])[0]
        self.user = await self.get_ticket_user(ticket)
        if not self.user:
            await self.close(code=4401)
            return
        self.groups_joined = set()
        self.personal_group = f'chat.user.{self.user.id}'
        await self.channel_layer.group_add(self.personal_group, self.channel_name)
        self.groups_joined.add(self.personal_group)
        await self.accept()
        became_online = await self.touch_presence()
        await self.send_json({'type': 'presence.snapshot', 'online_user_ids': await self.online_partner_ids()})
        if became_online:
            await self.broadcast_presence(True)

    async def disconnect(self, close_code):
        if getattr(self, 'user', None) and await self.remove_presence():
            await self.broadcast_presence(False)
        for group in getattr(self, 'groups_joined', set()):
            await self.channel_layer.group_discard(group, self.channel_name)

    async def receive_json(self, data, **kwargs):
        event_type = data.get('type')
        if event_type == 'subscribe':
            await self.subscribe(data.get('conversation_id'))
        elif event_type == 'send_message':
            await self.send_message(data)
        elif event_type == 'typing':
            await self.typing(data)
        elif event_type == 'read':
            await self.mark_read(data.get('conversation_id'))
        elif event_type == 'heartbeat':
            await self.touch_presence()

    async def subscribe(self, conversation_id):
        if not isinstance(conversation_id, int) or not await self.is_participant(conversation_id):
            await self.send_json({'type': 'error', 'detail': 'Conversation not found.'})
            return
        group = f'chat.conversation.{conversation_id}'
        if group not in self.groups_joined:
            await self.channel_layer.group_add(group, self.channel_name)
            self.groups_joined.add(group)

    async def send_message(self, data):
        conversation_id = data.get('conversation_id')
        content = data.get('content', '').strip() if isinstance(data.get('content'), str) else ''
        if not isinstance(conversation_id, int) or not content or len(content) > 4000 or not await self.is_participant(conversation_id):
            await self.send_json({'type': 'error', 'detail': 'Invalid message.'})
            return
        try:
            client_id = uuid.UUID(str(data.get('client_id'))) if data.get('client_id') else uuid.uuid4()
        except ValueError:
            await self.send_json({'type': 'error', 'detail': 'Invalid client id.'})
            return
        message, created = await self.create_message(conversation_id, content, client_id)
        payload = await self.serialize_message(message)
        if created:
            await self.unhide_participants(conversation_id)
            await self.channel_layer.group_send(f'chat.conversation.{conversation_id}', {'type': 'chat.event', 'event': 'message.created', 'payload': {'conversation_id': conversation_id, 'message': payload}})
            await self.notify_participants(conversation_id)
        else:
            await self.send_json({'type': 'message.ack', 'conversation_id': conversation_id, 'message': payload})

    async def typing(self, data):
        conversation_id = data.get('conversation_id')
        if isinstance(conversation_id, int) and await self.is_participant(conversation_id):
            await self.channel_layer.group_send(f'chat.conversation.{conversation_id}', {'type': 'chat.event', 'event': 'typing', 'payload': {'conversation_id': conversation_id, 'user_id': self.user.id, 'is_typing': bool(data.get('is_typing'))}})

    async def mark_read(self, conversation_id):
        if isinstance(conversation_id, int) and await self.is_participant(conversation_id):
            timestamp = await self.set_read(conversation_id)
            await self.channel_layer.group_send(f'chat.conversation.{conversation_id}', {'type': 'chat.event', 'event': 'conversation.read', 'payload': {'conversation_id': conversation_id, 'user_id': self.user.id, 'read_at': timestamp.isoformat()}})

    async def chat_event(self, event):
        await self.send_json({'type': event['event'], **event['payload']})

    def presence_key(self, user_id=None):
        return f'chat:presence:{user_id or self.user.id}'

    async def touch_presence(self):
        now, key = time.time(), self.presence_key()
        try:
            async with presence_redis.pipeline(transaction=True) as pipe:
                pipe.zremrangebyscore(key, '-inf', now - PRESENCE_TTL_SECONDS)
                pipe.zcard(key)
                pipe.zadd(key, {self.channel_name: now})
                pipe.expire(key, PRESENCE_TTL_SECONDS * 2)
                _, before, _, _ = await pipe.execute()
            return before == 0
        except Exception:
            return False

    async def remove_presence(self):
        try:
            removed = await presence_redis.zrem(self.presence_key(), self.channel_name)
            return bool(removed) and await presence_redis.zcard(self.presence_key()) == 0
        except Exception:
            return False

    async def is_user_online(self, user_id):
        try:
            key = self.presence_key(user_id)
            await presence_redis.zremrangebyscore(key, '-inf', time.time() - PRESENCE_TTL_SECONDS)
            return bool(await presence_redis.zcard(key))
        except Exception:
            return False

    async def online_partner_ids(self):
        return [user_id for user_id in await self.partner_ids() if await self.is_user_online(user_id)]

    async def broadcast_presence(self, online):
        for user_id in await self.partner_ids():
            await self.channel_layer.group_send(f'chat.user.{user_id}', {'type': 'chat.event', 'event': 'presence.changed', 'payload': {'user_id': self.user.id, 'online': online}})

    async def notify_participants(self, conversation_id):
        for user_id in await self.participant_ids(conversation_id):
            await self.channel_layer.group_send(f'chat.user.{user_id}', {'type': 'chat.event', 'event': 'conversation.changed', 'payload': {'conversation_id': conversation_id}})

    @database_sync_to_async
    def get_ticket_user(self, ticket):
        try:
            token = AccessToken(ticket)
            return User.objects.filter(pk=token['user_id'], is_active=True).first() if token.get('chat') else None
        except Exception:
            return None

    @database_sync_to_async
    def is_participant(self, conversation_id):
        return ConversationParticipant.objects.filter(conversation_id=conversation_id, user=self.user).exists()

    @database_sync_to_async
    def partner_ids(self):
        return list(ConversationParticipant.objects.filter(conversation__participants__user=self.user).exclude(user=self.user).values_list('user_id', flat=True).distinct())

    @database_sync_to_async
    def participant_ids(self, conversation_id):
        return list(ConversationParticipant.objects.filter(conversation_id=conversation_id).values_list('user_id', flat=True))

    @database_sync_to_async
    def unhide_participants(self, conversation_id):
        ConversationParticipant.objects.filter(conversation_id=conversation_id).update(hidden_at=None)

    @database_sync_to_async
    def create_message(self, conversation_id, content, client_id):
        message, created = ChatMessage.objects.get_or_create(conversation_id=conversation_id, sender=self.user, client_id=client_id, defaults={'content': content})
        if created:
            Conversation.objects.filter(pk=conversation_id).update(last_message_at=message.created_at)
        return message, created

    @database_sync_to_async
    def serialize_message(self, message):
        return ChatMessageSerializer(ChatMessage.objects.select_related('sender').get(pk=message.pk)).data

    @database_sync_to_async
    def set_read(self, conversation_id):
        timestamp = timezone.now()
        ConversationParticipant.objects.filter(conversation_id=conversation_id, user=self.user).update(last_read_at=timestamp)
        return timestamp
