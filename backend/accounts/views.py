from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import User
from .serializers import MyProfileSerializer, UserSerializer, UserWriteSerializer


class UserViewSet(ModelViewSet):
    queryset = User.objects.select_related('department').all()
    serializer_class = UserWriteSerializer
    permission_classes = (IsAdminUser,)
    lookup_field = 'username'

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return UserSerializer
        return UserWriteSerializer

    @action(detail=False, methods=('get', 'patch'), permission_classes=(IsAuthenticated,))
    def me(self, request):
        if request.method == 'PATCH':
            serializer = MyProfileSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(MyProfileSerializer(request.user).data)
