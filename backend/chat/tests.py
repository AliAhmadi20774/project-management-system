from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import User
from .models import ChatMessage, Conversation, ConversationParticipant


@override_settings(CHANNEL_LAYERS={"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}})
class DirectConversationApiTests(TestCase):
    def setUp(self):
        self.alice = User.objects.create_user(username="1001", email="alice@example.test", password="pass")
        self.bob = User.objects.create_user(username="1002", email="bob@example.test", password="pass")
        self.alice_client = APIClient()
        self.alice_client.force_authenticate(self.alice)
        self.bob_client = APIClient()
        self.bob_client.force_authenticate(self.bob)

    def start(self):
        return self.alice_client.post("/api/v1/chat/conversations/", {"user_id": self.bob.id}, format="json")

    def test_starting_the_same_direct_chat_twice_returns_one_conversation(self):
        first = self.start()
        second = self.start()
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(first.data["id"], second.data["id"])
        self.assertEqual(Conversation.objects.count(), 1)
        self.assertEqual(ConversationParticipant.objects.count(), 2)

    def test_recipient_does_not_see_empty_draft_but_sees_first_message(self):
        conversation_id = self.start().data["id"]
        self.assertEqual(self.bob_client.get("/api/v1/chat/conversations/").data, [])
        sent = self.alice_client.post(
            f"/api/v1/chat/conversations/{conversation_id}/messages/",
            {"content": "Hello", "client_id": "11111111-1111-4111-8111-111111111111"},
            format="json",
        )
        self.assertEqual(sent.status_code, 201)
        self.assertEqual(len(self.bob_client.get("/api/v1/chat/conversations/").data), 1)

    def test_deleting_a_conversation_hides_it_only_for_the_requesting_participant(self):
        conversation_id = self.start().data["id"]
        ChatMessage.objects.create(conversation_id=conversation_id, sender=self.alice, content="To remove")
        deleted = self.alice_client.delete(f"/api/v1/chat/conversations/{conversation_id}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertTrue(Conversation.objects.filter(pk=conversation_id).exists())
        self.assertEqual(ChatMessage.objects.count(), 1)
        self.assertEqual(self.alice_client.get("/api/v1/chat/conversations/").data, [])
        self.assertEqual(len(self.bob_client.get("/api/v1/chat/conversations/").data), 1)

    def test_read_receipt_is_exposed_to_the_sender(self):
        conversation_id = self.start().data["id"]
        self.alice_client.post(
            f"/api/v1/chat/conversations/{conversation_id}/messages/",
            {"content": "Read me", "client_id": "22222222-2222-4222-8222-222222222222"},
            format="json",
        )
        self.bob_client.post(f"/api/v1/chat/conversations/{conversation_id}/read/")
        messages = self.alice_client.get(f"/api/v1/chat/conversations/{conversation_id}/messages/").data["results"]
        self.assertTrue(messages[0]["read_by_recipient"])
