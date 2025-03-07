from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Scheduling
from .serializers import SchedulingSerializer

@api_view(["GET"])
def get_schedule(request):
    schedulings = Scheduling.objects.all()
    serializer = SchedulingSerializer(schedulings, many=True)
    return Response(serializer.data)

