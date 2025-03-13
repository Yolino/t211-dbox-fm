from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
from .models import Publication
from .serializers import AudioSerializer

class AudioView(APIView):
    def get(self, request, pk, *args, **kwargs):
        try:
            audio = Publication.objects.get(pk=pk).audio
            return FileResponse(audio, content_type="audio/mpeg")
        except Publication.DoesNotExist:
            return Response({"detail": "Audio not found"}, status=status.HTTP_404_NOT_FOUND)

