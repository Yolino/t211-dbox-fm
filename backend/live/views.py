from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Scheduling
from .serializers import SchedulingSerializer

@api_view(["GET"])
def get_schedule(request):
    date_param = request.query_params.get("date", None)
    if date_param:
        try:
            date = timezone.datetime.strptime(date_param, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        date = timezone.now().date()
    schedulings = Scheduling.objects.filter(time__date=date)
    serializer = SchedulingSerializer(schedulings, many=True)
    return Response(serializer.data)

