import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import Publication, View, Vote, Comment, Tag
from graphene_file_upload.scalars import Upload
from graphql import GraphQLError

class PublicationType(DjangoObjectType):
    class Meta:
        model = Publication
        fields = ("id", "title", "author", "cover", "tag", "description", "view_count", "vote_count", "created_at")

    cover = graphene.String()
    def resolve_cover(root, info):
        if root.cover:
            return root.cover.url
        return None

class ViewType(DjangoObjectType):
    class Meta:
        model = View
        fields = ("id", "publication", "user")

class VoteType(DjangoObjectType):
    class Meta:
        model = Vote
        fields = ("id", "publication", "user", "type")

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
    publications = graphene.List(graphene.NonNull(PublicationType), order_by=graphene.String(), author=graphene.String())
    commentsByPublication = graphene.List(graphene.NonNull(CommentType), publicationId=graphene.Int(required=True))
    tagnames= graphene.List(TagType)
   
    def resolve_publication(root, info, id):
        return Publication.objects.filter(id=id).first()

    def resolve_publications(root, info, order_by=None, author=None):
        result = Publication.objects.select_related("author")
        if author:
            result = result.filter(author__username__iexact=author)
        if order_by:
            result = result.order_by(order_by)
        return result
    
    def resolve_tagnames(root, info):
        return Tag.objects.all()
   
    def resolve_commentsByPublication(root, info, publicationId):
        return Comment.objects.filter(publication=publicationId)

class CreatePublication(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        cover = Upload()
        tag = graphene.Int(required=True)
        description = graphene.String(required=True)
        audio = Upload(required=True)

    publication = graphene.Field(PublicationType)

    def mutate(root, info, title, cover, tag, description, audio):
        if not info.context.user.is_authenticated:
            raise GraphQLError("You cannot publish if you are not already authenticated")
 
        tag = Tag.objects.get(id=tag)
        author = info.context.user
        publication = Publication(title=title, cover=cover, tag=tag,description=description, audio=audio,author=author)
        publication.save()

        return CreatePublication(publication=publication)

class CreateView(graphene.Mutation):
    class Arguments:
        publication_id = graphene.Int(required=True)

    view_count = graphene.Int()

    def mutate(root, info, publication_id):
        user = info.context.user
        if not user.is_authenticated:
            return CreateView(view_count=None)
        if View.objects.filter(publication_id=publication_id, user=user).exists():
            return CreateView(view_count=None)

        publication = Publication.objects.get(id=publication_id)
        View.objects.create(publication=publication, user=user)
        publication.refresh_from_db()
        return CreateView(view_count=publication.view_count)

class CreateVote(graphene.Mutation):
    class Arguments:
        publication_id = graphene.Int(required=True)
        type = graphene.Int(required=True)

    vote_count = graphene.Int()

    def mutate(root, info, publication_id, type):
        user = info.context.user
        if not user.is_authenticated:
            return CreateVote(vote_count=None)
        if Vote.objects.filter(publication_id=publication_id, user=user).exists():
            return CreateVote(vote_count=None)

        publication = Publication.objects.get(id=publication_id)
        Vote.objects.create(publication=publication, user=user, type=type)
        publication.refresh_from_db()
        return CreateVote(vote_count=publication.vote_count)

class CreateComment(graphene.Mutation):
    class Arguments:
        publication = graphene.Int(required=True)  
        parent = graphene.Int()
        text = graphene.String(required=True)

    comment = graphene.Field(CommentType)

    def mutate(self, info, publication, text, parent=None):
        if not info.context.user.is_authenticated:
            raise GraphQLError("You must be logged in to comment.")
        try:
            publication_instance = Publication.objects.get(id=publication)
        except Publication.DoesNotExist:
            raise GraphQLError("Publication not found.")
        parent_comment = None
        if parent:
            try:
                parent_comment = Comment.objects.get(id=parent)
            except Comment.DoesNotExist:
                raise GraphQLError("Parent comment not found.")

        author = info.context.user
        comment = Comment(publication = publication_instance, parent=parent_comment, text=text, author=author)
        comment.save()
        return CreateComment(comment=comment)
    
class Mutation(graphene.ObjectType):
    create_publication = CreatePublication.Field()
    create_view = CreateView.Field()
    create_vote = CreateVote.Field()
    create_comment = CreateComment.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
