from rest_framework import serializers
from .models import Publication

class AudioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = ("id", "audio")

