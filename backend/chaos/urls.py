from django.urls import path

from . import views

urlpatterns = [
    path('session/start/', views.session_start, name='session-start'),
    path('events/', views.log_event, name='log-event'),
    path('dashboard/summary/', views.dashboard_summary, name='dashboard-summary'),
]
