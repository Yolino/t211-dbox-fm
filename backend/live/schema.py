import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from django.utils import timezone
from datetime import datetime
from .models import Scheduling

class SchedulingType(DjangoObjectType):
    class Meta:
        model = Scheduling
        fields = ("id", "publication", "time")

class Query(graphene.ObjectType):
    schedule = graphene.List(SchedulingType, date=graphene.Date())

    def resolve_schedule(root, info, date=None):
        if not date:
            date = timezone.now().date()
        return Scheduling.objects.filter(time__date=date)

class Mutation(graphene.ObjectType):
    pass
