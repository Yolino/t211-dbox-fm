from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Scheduling, AudioLowQuality
from .serializers import SchedulingSerializer

@api_view(["GET"])
def get_schedule(request):
    schedulings = Scheduling.objects.all()
    serializer = SchedulingSerializer(schedulings, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_audio_low_quality(request, pk):
    try:
        audio_low_quality = AudioLowQuality.objects.get(pk=pk)
        return Response(audio_low_quality.content, content_type="text/plain")
    except AudioLowQuality.DoesNotExist:
        return Response({"detail": "AudioLowQuality not found"}, status=status.HTTP_404_NOT_FOUND)

