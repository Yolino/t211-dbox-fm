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
        if publication.is_banned and not (request.user.is_authenticated and request.user.has_perm("moderation.view_reportpublication")):
            raise PermissionDenied("You do not have permission to view banned Publications")
        return FileResponse(publication.audio, content_type="audio/mpeg")

