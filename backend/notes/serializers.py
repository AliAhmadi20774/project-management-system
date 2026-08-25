from rest_framework import serializers

from .models import PersonalNote


class PersonalNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalNote
        fields = ('id', 'title', 'body', 'content', 'folder', 'color', 'tags', 'is_pinned', 'is_archived', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_tags(self, value):
        if not isinstance(value, list) or not all(isinstance(tag, str) and len(tag) <= 40 for tag in value):
            raise serializers.ValidationError('Tags must be a list of short text values.')
        return list(dict.fromkeys(tag.strip().lstrip('#') for tag in value if tag.strip()))[:12]
