from rest_framework import serializers

from organizations.serializers import DepartmentSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    department_detail = DepartmentSerializer(source='department', read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'first_name', 'last_name', 'email', 'mobile',
            'job_title', 'department', 'department_detail', 'is_active',
            'is_staff', 'is_superuser', 'date_joined', 'last_login',
        )
        read_only_fields = ('id', 'is_staff', 'is_superuser', 'date_joined', 'last_login')
        extra_kwargs = {'password': {'write_only': True}}


class UserWriteSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ('password',)
        read_only_fields = ('id', 'date_joined', 'last_login')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user


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
