from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, LogoutView, CurrentUserView,
    NotebookViewSet, EntryViewSet, stats_view, calendar_view
)

router = DefaultRouter()
router.register(r'notebooks', NotebookViewSet, basename='notebook')
router.register(r'entries', EntryViewSet, basename='entry')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/user/', CurrentUserView.as_view(), name='current-user'),
    path('stats/', stats_view, name='stats'),
    path('calendar/<int:year>/<int:month>/', calendar_view, name='calendar'),
    path('', include(router.urls)),
]
