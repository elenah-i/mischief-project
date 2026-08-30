from rest_framework import serializers

from .models import Event


class SessionStartSerializer(serializers.Serializer):
    visitor_id = serializers.UUIDField(required=False)
    device_type = serializers.ChoiceField(
        choices=['mobile', 'desktop', 'unknown'], required=False, default='unknown'
    )


class EventSerializer(serializers.ModelSerializer):
    session_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Event
        fields = [
            'id',
            'session_id',
            'event_type',
            'experience_key',
            'music_choice',
            'metadata',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        from .models import Session

        session_id = validated_data.pop('session_id')
        session = Session.objects.get(id=session_id)
        return Event.objects.create(session=session, **validated_data)
