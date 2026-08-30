from django.contrib import admin

from .models import Event, Session, Visitor


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_seen', 'visit_count')


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'visitor', 'device_type', 'started_at')
    list_filter = ('device_type',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'experience_key', 'music_choice', 'session', 'created_at')
    list_filter = ('event_type', 'music_choice')
