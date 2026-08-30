import uuid

from django.db import models


class Visitor(models.Model):
    """An anonymous visitor, identified only by a random UUID stored
    client-side. No name, email, or IP is stored here on purpose."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_seen = models.DateTimeField(auto_now_add=True)
    visit_count = models.PositiveIntegerField(default=1)

    def __str__(self):
        return str(self.id)


class Session(models.Model):
    DEVICE_CHOICES = [
        ('mobile', 'Mobile'),
        ('desktop', 'Desktop'),
        ('unknown', 'Unknown'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visitor = models.ForeignKey(Visitor, related_name='sessions', on_delete=models.CASCADE)
    device_type = models.CharField(max_length=16, choices=DEVICE_CHOICES, default='unknown')
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return str(self.id)


class Event(models.Model):
    """A single anonymous interaction: a stage view, a button click, a
    music choice, etc. This is the whole analytics pipeline - no per-user
    profiles, just an append-only log of what happened."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(Session, related_name='events', on_delete=models.CASCADE)
    event_type = models.CharField(max_length=64)
    experience_key = models.CharField(max_length=64, blank=True, default='')
    music_choice = models.CharField(max_length=64, blank=True, default='')
    metadata = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'{self.event_type} @ {self.created_at:%Y-%m-%d %H:%M}'
