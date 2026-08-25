from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ChatTicketView, ChatUsersView, ConversationViewSet

router = DefaultRouter()
router.register('chat/conversations', ConversationViewSet, basename='chat-conversation')
urlpatterns = [path('chat/ticket/', ChatTicketView.as_view()), path('chat/users/', ChatUsersView.as_view())] + router.urls
