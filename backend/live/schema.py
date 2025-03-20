import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Scheduling
from content.models import Publication

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

class CreateScheduling(graphene.Mutation):
    class Arguments:
        publication_id = graphene.Int(required=True)
        time = graphene.DateTime(required=True)

    scheduling = graphene.Field(SchedulingType)

    def mutate(root, info, publication_id, time):
        user = info.context.user
        if not user.is_authenticated:
            raise GraphQLError("You must be logged in as a privileged user to add to the schedule")
        if not user.has_perm("live.add_scheduling"):
            raise GraphQLError("You do not have the required permissions to add to the schedule")
        # WARNING : a timedelta of one day should be added in production : if time < (datetime.now() + timedelta(days=1))
        if time < datetime.now():
            raise GraphQLError("The schedule for this date and time has already been fixed. You cannot update it")
        try:
            publication = Publication.objects.get(id=publication_id)
        except Publication.DoesNotExist:
            raise GraphQLError("This Publication does not exist")
        scheduling = Scheduling(publication=publication, time=time)
        scheduling.save()
        return CreateScheduling(scheduling=scheduling)

class DeleteScheduling(graphene.Mutation):
    class Arguments:
        scheduling_id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, scheduling_id):
        user = info.context.user
        if not user.is_authenticated:
            raise GraphQLError("You must be logged in as a privileged user to delete from the schedule")
        if not user.has_perm("live.delete_scheduling"):
            raise GraphQLError("You do not have the required permissions to delete from the schedule")
        try:
            scheduling = Scheduling.objects.get(id=scheduling_id)
        except Scheduling.DoesNotExist:
            raise GraphQLError("This Scheduling does not exist")
        scheduling.delete()
        return DeleteScheduling(success=True)

class Mutation(graphene.ObjectType):
    create_scheduling = CreateScheduling.Field()
    delete_scheduling = DeleteScheduling.Field()
