from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import FileResponse
from .models import Audio
from .serializers import AudioSerializer

class AudioView(APIView):
    def get(self, request, pk, *args, **kwargs):
        try:
            audio = Audio.objects.get(pk=pk)
            return FileResponse(audio.file, content_type="audio/mpeg")
        except Audio.DoesNotExist:
            return Response({"detail": "Audio not found"}, status=status.HTTP_404_NOT_FOUND)

