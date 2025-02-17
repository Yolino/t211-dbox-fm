import graphene
from graphene_django.types import DjangoObjectType
from .models import Test

class MessageType(DjangoObjectType):
    class Meta:
        model = Test
        fields = ("id", "name")

class Query(graphene.ObjectType):
    test_count = graphene.Int()

    def resolve_test_count(root, info):
        return Test.objects.count()

schema = graphene.Schema(query=Query)
