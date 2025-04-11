from django.urls import path
from .views import verify_email_view

urlpatterns = [
    path('verify-email/', verify_email_view, name='verify-email'),
]
