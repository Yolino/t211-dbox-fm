from django.urls import path
from .views import AudioView

urlpatterns = [
    path("audio/<int:pk>/", AudioView.as_view(), name="audio"),
]
