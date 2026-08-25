import uuid
from datetime import timedelta

from asgiref.sync import async_to_sync
from django.db import transaction
from django.db.models import Count, Q
from channels.layers import get_channel_layer
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import User
from .models import ChatMessage, Conversation, ConversationParticipant
from .serializers import ChatMessageSerializer, ConversationSerializer, SendMessageSerializer, StartConversationSerializer, user_data


def conversation_queryset(user):
    # A recipient sees a conversation only once it contains a message.  The
    # initiating user may still see their empty draft and write the first one.
    return Conversation.objects.filter(participants__user=user, participants__hidden_at__isnull=True).filter(
        Q(messages__isnull=False) | Q(created_by=user)
    ).prefetch_related('participants__user').distinct()


def participant_queryset(user):
    return Conversation.objects.filter(participants__user=user).prefetch_related('participants__user').distinct()


def broadcast(conversation_id, event, payload):
    from channels.layers import get_channel_layer
    async_to_sync(get_channel_layer().group_send)(f'chat.conversation.{conversation_id}', {'type': 'chat.event', 'event': event, 'payload': payload})


def notify_participants(conversation_id):
    channel_layer = get_channel_layer()
    for user_id in ConversationParticipant.objects.filter(conversation_id=conversation_id).values_list('user_id', flat=True):
        async_to_sync(channel_layer.group_send)(f'chat.user.{user_id}', {'type': 'chat.event', 'event': 'conversation.changed', 'payload': {'conversation_id': conversation_id}})


class ConversationViewSet(GenericViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = ConversationSerializer

    def list(self, request):
        return Response(self.get_serializer(conversation_queryset(request.user), many=True).data)

    def create(self, request):
        data = StartConversationSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        other = User.objects.filter(pk=data.validated_data['user_id'], is_active=True).first()
        if not other or other == request.user:
            return Response({'user_id': ['Choose another active user.']}, status=400)
        with transaction.atomic():
            # Lock both users in a stable order.  Two tabs cannot create two
            # direct conversations for the same pair while this transaction is
            # in progress.
            list(User.objects.select_for_update().filter(pk__in=sorted((request.user.pk, other.pk))).order_by('pk'))
            pair_ids = ConversationParticipant.objects.filter(
                user_id__in=(request.user.id, other.id)
            ).values('conversation_id').annotate(
                matching_users=Count('user_id', distinct=True)
            ).filter(matching_users=2).values('conversation_id')
            candidate = Conversation.objects.filter(pk__in=pair_ids).annotate(
                participant_count=Count('participants')
            ).filter(participant_count=2).first()
            if candidate:
                ConversationParticipant.objects.filter(conversation=candidate, user=request.user).update(hidden_at=None)
                return Response(self.get_serializer(candidate).data)
            conversation = Conversation.objects.create(created_by=request.user)
            ConversationParticipant.objects.bulk_create([ConversationParticipant(conversation=conversation, user=request.user), ConversationParticipant(conversation=conversation, user=other)])
        return Response(self.get_serializer(conversation_queryset(request.user).get(pk=conversation.pk)).data, status=201)

    def get_object(self):
        return participant_queryset(self.request.user).get(pk=self.kwargs['pk'])

    def destroy(self, request, pk=None):
        conversation = self.get_object()
        ConversationParticipant.objects.filter(conversation=conversation, user=request.user).update(hidden_at=timezone.now())
        return Response(status=204)

    @action(detail=True, methods=('get', 'post'), url_path='messages')
    def messages(self, request, pk=None):
        conversation = self.get_object()
        if request.method == 'POST':
            serializer = SendMessageSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            message, _ = ChatMessage.objects.get_or_create(conversation=conversation, sender=request.user, client_id=serializer.validated_data.get('client_id') or uuid.uuid4(), defaults={'content': serializer.validated_data['content']})
            Conversation.objects.filter(pk=conversation.pk).update(last_message_at=message.created_at)
            ConversationParticipant.objects.filter(conversation=conversation).update(hidden_at=None)
            payload = ChatMessageSerializer(ChatMessage.objects.select_related('sender').get(pk=message.pk)).data
            broadcast(conversation.pk, 'message.created', {'conversation_id': conversation.pk, 'message': payload})
            notify_participants(conversation.pk)
            return Response(payload, status=201)
        before = request.query_params.get('before')
        messages = ChatMessage.objects.filter(conversation=conversation, deleted_at__isnull=True).select_related('sender')
        if before and before.isdigit(): messages = messages.filter(id__lt=int(before))
        page = list(messages[:50]); page.reverse()
        return Response({'results': ChatMessageSerializer(page, many=True).data, 'next_before': page[0].id if len(page) == 50 else None})

    @action(detail=True, methods=('post',), url_path='read')
    def read(self, request, pk=None):
        conversation = self.get_object(); timestamp = timezone.now()
        ConversationParticipant.objects.filter(conversation=conversation, user=request.user).update(last_read_at=timestamp)
        broadcast(conversation.pk, 'conversation.read', {'conversation_id': conversation.pk, 'user_id': request.user.id, 'read_at': timestamp.isoformat()})
        return Response(status=204)


class ChatTicketView(APIView):
    permission_classes = (IsAuthenticated,)
    def post(self, request):
        token = AccessToken.for_user(request.user); token['chat'] = True; token.set_exp(lifetime=timedelta(minutes=1))
        return Response({'ticket': str(token), 'expires_in': 60})


class ChatUsersView(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request):
        users = User.objects.filter(is_active=True).exclude(pk=request.user.pk).order_by('first_name', 'last_name', 'username')
        return Response([user_data(user) for user in users])
