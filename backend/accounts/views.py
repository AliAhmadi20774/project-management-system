from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import User
from .permissions import CanManageUsers
from .serializers import MyProfileSerializer, UserSerializer, UserWriteSerializer


class UserViewSet(ModelViewSet):
    queryset = User.objects.select_related('department').all()
    serializer_class = UserWriteSerializer
    permission_classes = (IsAdminUser,)

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return UserSerializer
        return UserWriteSerializer

    def get_permissions(self):
        # Managers may onboard ordinary users; account mutation and elevated
        # access assignment remain exclusive to System Admins.
        if self.action == 'me':
            return (IsAuthenticated(),)
        if self.action in ('list', 'create'):
            return (CanManageUsers(),)
        if self.action == 'retrieve':
            return (IsAuthenticated(),)
        return (IsAdminUser(),)

    @action(detail=False, methods=('get', 'patch'), permission_classes=(IsAuthenticated,))
    def me(self, request):
        if request.method == 'PATCH':
            serializer = MyProfileSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        return Response(MyProfileSerializer(request.user).data)
