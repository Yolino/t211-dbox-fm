import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import get_user_model
from .models import Audio, Publication, Comment

User = get_user_model()
class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ("id", "username")

class AudioType(DjangoObjectType):
    class Meta:
        model = Audio
        fields = ("id",)

class PublicationType(DjangoObjectType):
    class Meta:
        model = Publication
        fields = ("id", "title", "author", "tag", "description", "audio", "view_count", "vote_count", "created_at")

class CommentType(DjangoObjectType):
    class Meta:
        model = Comment
        fields = ("id", "text")

class Query(graphene.ObjectType):
    publication = graphene.Field(PublicationType, id=graphene.Int(required=True))
    publications = graphene.List(PublicationType)
    #comments_by_publication

    def resolve_publication(root, info, id):
        try:
            return Publication.objects.get(id=id)
        except Publication.DoesNotExist:
            return None

    def resolve_publications(root, info):
        return Publication.objects.all()

schema = graphene.Schema(query=Query)
