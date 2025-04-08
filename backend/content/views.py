from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from django.http import FileResponse
from .models import Publication
from .serializers import AudioSerializer

class AudioView(APIView):
    def get(self, request, pk, *args, **kwargs):
        try:
            publication = Publication.objects.get(pk=pk)
        except Publication.DoesNotExist:
            return Response({"detail": "Audio not found"}, status=status.HTTP_404_NOT_FOUND)
        if publication.is_banned:
            raise PermissionDenied("This Publication has been banned. You can no longer access it")
        return FileResponse(publication.audio, content_type="audio/mpeg")

