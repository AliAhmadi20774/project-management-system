from rest_framework import serializers

from organizations.serializers import DepartmentSerializer
from projects.permissions import PROJECT_MANAGER_GROUP

from .models import User

# Served by the Next.js UI, not by an external avatar service. Keeping this
# path relative means the browser requests it from the same application.
DEFAULT_YOUNG_MAN_AVATAR_URL = '/avatars/default-young-man.png'
DEFAULT_AVATAR_URLS = {
    'young-man': DEFAULT_YOUNG_MAN_AVATAR_URL,
    'young-man-glasses': '/avatars/default-young-man-glasses.png',
    'engineer-curly': '/avatars/engineer-curly.png',
    'engineer-beard': '/avatars/engineer-beard.png',
    'engineer-auburn': '/avatars/engineer-auburn.png',
    'engineer-senior': '/avatars/engineer-senior.png',
    'engineer-east-asian': '/avatars/engineer-east-asian.png',
    'engineer-south-asian': '/avatars/engineer-south-asian.png',
    'engineer-blond': '/avatars/engineer-blond.png',
}


class UserSerializer(serializers.ModelSerializer):
    department_detail = DepartmentSerializer(source='department', read_only=True)
    access_role = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'first_name', 'last_name', 'email', 'mobile', 'avatar', 'avatar_seed', 'avatar_url',
            'job_title', 'department', 'department_detail', 'access_role', 'is_active',
            'is_staff', 'is_superuser', 'date_joined', 'last_login',
        )
        read_only_fields = ('id', 'is_staff', 'is_superuser', 'date_joined', 'last_login')
        extra_kwargs = {'password': {'write_only': True}}

    def get_access_role(self, user):
        if user.is_superuser:
            return 'system_admin'
        if user.groups.filter(name=PROJECT_MANAGER_GROUP).exists():
            return 'manager'
        return 'user'

    def get_avatar_url(self, user):
        if user.avatar:
            return user.avatar.url
        # A fixed friendly fallback keeps accounts without an uploaded image or
        # a selected UI avatar visually consistent.
        return DEFAULT_AVATAR_URLS.get(user.avatar_seed, DEFAULT_YOUNG_MAN_AVATAR_URL)

    def validate_email(self, value):
        # HTML form submissions represent an empty optional email as "". Store
        # it as NULL so the unique constraint permits multiple users without one.
        return value or None


class UserWriteSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, required=False)
    access_role = serializers.ChoiceField(
        choices=('user', 'manager', 'system_admin'), write_only=True, required=False, default='user'
    )

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ('password',)
        read_only_fields = ('id', 'is_staff', 'is_superuser', 'date_joined', 'last_login')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        access_role = validated_data.pop('access_role', 'user')
        if access_role in ('manager', 'system_admin') and not self.context['request'].user.is_superuser:
            raise serializers.ValidationError({
                'access_role': 'Only a system administrator can assign manager or system administrator access.'
            })
        user = User(**validated_data)
        if access_role == 'system_admin':
            user.is_staff = True
            user.is_superuser = True
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        if access_role == 'manager':
            from django.contrib.auth.models import Group
            group, _ = Group.objects.get_or_create(name=PROJECT_MANAGER_GROUP)
            user.groups.add(group)
        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # The input field is write-only so clients cannot try to mutate a role
        # through a regular user update, but creation responses still need the
        # effective access level for the Users table.
        data['access_role'] = self.get_access_role(instance)
        return data


class MyProfileSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        read_only_fields = (
            'id', 'username', 'department', 'department_detail', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login',
        )

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=('password',))
        return user
