from django.urls import path
from .views import get_schedule, get_audio_low_quality

urlpatterns = [
    path("schedule/", get_schedule, name="get_schedule"),
    path("audiolowquality/<int:pk>/", get_audio_low_quality, name="get_audio_low_quality"),
]
