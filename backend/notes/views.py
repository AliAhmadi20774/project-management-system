from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .models import PersonalNote
from .serializers import PersonalNoteSerializer


class PersonalNoteViewSet(ModelViewSet):
    serializer_class = PersonalNoteSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return PersonalNote.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
