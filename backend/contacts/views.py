from accounts.models import User
from django.db import transaction
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import Contact
from .serializers import ContactSerializer


class ContactViewSet(ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Contact.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=('post',), url_path='bulk-import')
    def bulk_import(self, request):
        items = request.data.get('contacts')
        if not isinstance(items, list) or not items:
            return Response({'contacts': ['Add at least one contact.']}, status=400)
        if len(items) > 1000:
            return Response({'contacts': ['A file can contain at most 1,000 contacts.']}, status=400)
        serializer = ContactSerializer(data=items, many=True)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            contacts = [Contact(owner=request.user, **item) for item in serializer.validated_data]
            Contact.objects.bulk_create(contacts)
        return Response(ContactSerializer(contacts, many=True).data, status=201)

    @action(detail=False, methods=('get',), url_path='user-names')
    def user_names(self, request):
        """Name-only picker; selected values are copied into a contact."""
        users = User.objects.filter(is_active=True).order_by('first_name', 'last_name', 'username')
        return Response([
            {'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name, 'username': user.username}
            for user in users
        ])
