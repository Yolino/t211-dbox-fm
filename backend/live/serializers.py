from rest_framework import serializers
from .models import Scheduling

class SchedulingSerializer(serializers.ModelSerializer):
    audio_id = serializers.IntegerField(source="publication.audio.id", read_only=True)
    class Meta:
        model = Scheduling
        fields = ("time", "audio_id")

