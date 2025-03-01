from rest_framework import serializers
from .models import Scheduling

class SchedulingSerializer(serializers.ModelSerializer):
    audio_low_quality_id = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Scheduling
        fields = ("time", "audio_low_quality_id")

