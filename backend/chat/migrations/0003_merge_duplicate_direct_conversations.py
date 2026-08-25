from django.db import migrations
from django.db.models import Count, Max


def merge_duplicate_direct_conversations(apps, schema_editor):
    Conversation = apps.get_model('chat', 'Conversation')
    ConversationParticipant = apps.get_model('chat', 'ConversationParticipant')
    ChatMessage = apps.get_model('chat', 'ChatMessage')

    pairs = {}
    conversations = Conversation.objects.annotate(participant_count=Count('participants')).filter(participant_count=2)
    for conversation in conversations:
        user_ids = tuple(sorted(ConversationParticipant.objects.filter(conversation_id=conversation.id).values_list('user_id', flat=True)))
        pairs.setdefault(user_ids, []).append(conversation)

    for duplicates in pairs.values():
        if len(duplicates) < 2:
            continue
        # Keep the most recently active conversation, moving all messages to it.
        duplicates.sort(key=lambda item: (item.last_message_at is not None, item.last_message_at or item.updated_at, item.id), reverse=True)
        canonical, obsolete = duplicates[0], duplicates[1:]
        for conversation in obsolete:
            ChatMessage.objects.filter(conversation_id=conversation.id).update(conversation_id=canonical.id)
            conversation.delete()
        latest = ChatMessage.objects.filter(conversation_id=canonical.id).aggregate(latest=Max('created_at'))['latest']
        Conversation.objects.filter(pk=canonical.id).update(last_message_at=latest)


class Migration(migrations.Migration):
    dependencies = [('chat', '0002_conversation_created_by')]

    operations = [migrations.RunPython(merge_duplicate_direct_conversations, migrations.RunPython.noop)]
