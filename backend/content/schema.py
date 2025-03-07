import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import get_user_model
from .models import Audio, Publication, Comment, Tag
from users.schema import UserType

User = get_user_model()

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
        fields = ("id", "text", "author", "publication",  "created_at")

class TagType(DjangoObjectType):
    class Meta:
        model = Tag
        field = ("name")

class Query(graphene.ObjectType):
    publication = graphene.Field(PublicationType, id=graphene.Int(required=True))
    publications = graphene.List(PublicationType, order_by=graphene.String())
    publicationsAuthor = graphene.List(PublicationType, author=graphene.String(required=True))
    commentsByPublication = graphene.List(CommentType, publicationId=graphene.Int(required=True))
    userUsernames = graphene.List(UserType)
    tagnames= graphene.List(TagType)

    def resolve_commentsByPublication(root, info, publicationId):
        try:
            return Comment.objects.filter(publication=publicationId)
        except Comment.DoesNotExist:
            return None
    def resolve_publicationsAuthor(root, info, author):
        # Récupérer l'utilisateur par son nom d'utilisateur
        try:
            user = User.objects.get(username=author)
            # Filtrer les publications par l'utilisateur
            return Publication.objects.filter(author=user)
        except User.DoesNotExist:
            # Si l'utilisateur n'existe pas, retourner une liste vide
            return None
        
    def resolve_publication(root, info, id):
        try:
            return Publication.objects.get(id=id)
        except Publication.DoesNotExist:
            return None

    def resolve_publications(root, info, order_by=None):
        result = Publication.objects.all()
        if order_by:
            result = result.order_by(order_by)
        return result
    
    def resolve_userUsernames(root, info):
        return User.objects.all()
    
    def resolve_tagnames(root, info):
        return Tag.objects.all()

schema = graphene.Schema(query=Query)
