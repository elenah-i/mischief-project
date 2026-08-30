from django.db.models import Count
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Event, Session, Visitor
from .serializers import EventSerializer, SessionStartSerializer


@api_view(['POST'])
def session_start(request):
    """Creates (or resumes) an anonymous visitor and always creates a new
    session. No auth, no accounts - just a UUID handed back to the client
    to store and replay on the next visit."""

    serializer = SessionStartSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    visitor_id = data.get('visitor_id')
    if visitor_id:
        visitor, created = Visitor.objects.get_or_create(id=visitor_id)
        if not created:
            visitor.visit_count += 1
            visitor.save(update_fields=['visit_count'])
    else:
        visitor = Visitor.objects.create()

    session = Session.objects.create(visitor=visitor, device_type=data.get('device_type', 'unknown'))

    return Response(
        {'visitor_id': str(visitor.id), 'session_id': str(session.id)},
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
def log_event(request):
    serializer = EventSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def dashboard_summary(request):
    """Aggregated, anonymous stats for the /dashboard view. Add
    authentication here before you deploy this publicly - right now it's
    wide open, which is fine for local development only."""

    total_visitors = Visitor.objects.count()
    total_sessions = Session.objects.count()
    sessions_today = Session.objects.filter(started_at__date=timezone.now().date()).count()
    returning_visitors = Visitor.objects.filter(visit_count__gt=1).count()

    experience_counts = (
        Event.objects.exclude(experience_key='')
        .values('experience_key')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    music_counts = (
        Event.objects.exclude(music_choice='')
        .values('music_choice')
        .annotate(total=Count('id'))
        .order_by('-total')
    )
    event_type_counts = Event.objects.values('event_type').annotate(total=Count('id')).order_by('-total')

    return Response(
        {
            'total_visitors': total_visitors,
            'total_sessions': total_sessions,
            'sessions_today': sessions_today,
            'returning_visitors': returning_visitors,
            'experience_counts': list(experience_counts),
            'music_counts': list(music_counts),
            'event_type_counts': list(event_type_counts),
        }
    )
