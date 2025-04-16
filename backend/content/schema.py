import graphene
from graphene_django import DjangoObjectType
from graphene_file_upload.scalars import Upload
from graphql import GraphQLError
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import Publication, View, Vote, Comment, Tag
from moderation.models import ReportPublication
from .validators import validate_image, validate_audio

class PublicationType(DjangoObjectType):
    class Meta:
        model = Publication
        fields = ("id", "title", "author", "cover", "tag", "description", "view_count", "vote_count", "created_at")

    cover = graphene.String()
    def resolve_cover(root, info):
        if root.cover:
            return root.cover.url
        return None

    visitor_vote = graphene.String()
    def resolve_visitor_vote(root, info):
        user = info.context.user
        if user.is_authenticated:
            try:
                return Vote.objects.get(publication=root, user=user).type
            except Vote.DoesNotExist:
                return None
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
        fields = ("id", "text", "author", "parent", "publication",  "created_at")

class TagType(DjangoObjectType):
    class Meta:
        model = Tag
        field = ("name")

class Query(graphene.ObjectType):
    publication = graphene.Field(PublicationType, id=graphene.Int(required=True))
    publications = graphene.List(graphene.NonNull(PublicationType), count=graphene.Int(), order_by=graphene.String(), author=graphene.String())
    comments_by_publication = graphene.List(graphene.NonNull(CommentType), publication_id=graphene.Int(required=True))
    tags = graphene.List(TagType)
   
    def resolve_publication(root, info, id):
        try:
            publication = Publication.objects.get(id=id)
        except Publication.DoesNotExist:
            raise GraphQLError("This Publication does not exist")
        if publication.is_banned and not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.view_reportpublication")):
            raise GraphQLError("You are not allowed to view this Publication")
        return publication

    def resolve_publications(root, info, count=None, order_by=None, author=None):
        result = Publication.objects.select_related("author")
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.view_reportpublication")):
            result = result.filter(is_banned=False)
        if author:
            result = result.filter(author__username__iexact=author)
        if order_by:
            result = result.order_by(order_by)
        if count and len(result) > count :
            result = result[:count]
        return result
    
    def resolve_tags(root, info):
        return Tag.objects.all()
   
    def resolve_comments_by_publication(root, info, publication_id):
        comments = Comment.objects.filter(publication=publication_id)
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.view_reportcomment")):
            comments.filter(is_banned=False)
        return comments

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
            raise GraphQLError("You must be logged in to publish")
        try:
            tag = Tag.objects.get(id=tag)
        except Tag.DoesNotExist:
            raise GraphQLError("This Tag does not exist")
        author = info.context.user

        if cover:
            try:
                validate_image(cover)
            except ValidationError as e:
                raise GraphQLError(str(e))
        try:
            validate_audio(audio)
        except ValidationError as e:
            raise GraphQLError(str(e))

        publication = Publication(title=title, cover=cover, tag=tag,description=description, audio=audio,author=author)
        publication.save()
        return CreatePublication(publication=publication)

class UpdatePublication(graphene.Mutation):
    class Arguments:
        publication_id = graphene.Int(required=True)
        title = graphene.String()
        cover = Upload()
        remove_cover = graphene.Boolean(required=True)
        tag = graphene.Int()
        description = graphene.String()

    success = graphene.Boolean()

    def mutate(root, info, publication_id, title, cover, remove_cover, tag, description):
        user = info.context.user
        if not user.is_authenticated:
            raise GraphQLError("You cannot update a Publication if you are not authenticated")
        try:
            publication = Publication.objects.get(id=publication_id)
        except Publication.DoesNotExist:
            raise GraphQLError("This Publication does not exist")
        if not publication.author == user:
            raise GraphQLError("You cannot update a Publication you do not own")
        if publication.is_banned:
            raise GraphQLError("This Publication has been banned. You can no longer view, update or delete it")
        if ReportPublication.objects.filter(reported_publication=publication, is_reviewed=False).exists():
            raise GraphQLError("This Publication is currently flagged. You cannot update or delete it")
        if not title and not cover and not remove_cover and not tag and not description:
            raise GraphQLError("You need to specify at least one field in order to update this publication")
        if title:
            publication.title = title
        if remove_cover:
            if publication.cover:
                publication.cover.delete(save=False)
            publication.cover = None
        elif cover:
            try:
                validate_image(cover)
            except ValidationError as e:
                raise GraphQLError(str(e))
            publication.cover = cover
        if tag:
            try:
                tag =Tag.objects.get(id=tag)
            except Tag.DoesNotExist:
                raise GraphQLError("This Tag does not exist")
            publication.tag = tag
        if description:
            publication.description = description
        publication.save()
        return UpdatePublication(success=True)

class DeletePublication(graphene.Mutation):
    class Arguments:
        publication_id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, publication_id):
        user = info.context.user
        if not user.is_authenticated:
            raise GraphQLError("You cannot delete a Publication if you are not authenticated")
        try:
            publication = Publication.objects.get(id=publication_id)
        except Publication.DoesNotExist:
            raise GraphQLError("This Publication does not exist")
        if not publication.author == user:
            raise GraphQLError("You cannot delete a Publication you do not own")
        if publication.is_banned:
            raise GraphQLError("This Publication has been banned. You can no longer view, update or delete it")
        if ReportPublication.objects.filter(reported_publication=publication, is_reviewed=False).exists():
            raise GraphQLError("This Publication is currently flagged. You cannot update or delete it")
        publication.delete()
        return DeletePublication(success=True)

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
        try:
            publication = Publication.objects.get(id=publication_id)
        except Publication.DoesNotExist:
            raise GraphQLError("This Publication does not exist")
        if publication.is_banned:
            raise GraphQLError("This Publication has been banned. You can no longer access it")
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
        if (abs(type) > 1 and not user.is_staff) or not type:
            raise GraphQLError("You are not allowed to have such a weight for your vote")
        if Vote.objects.filter(publication_id=publication_id, user=user).exists():
            return CreateVote(vote_count=None)
        try:
            publication = Publication.objects.get(id=publication_id)
        except Publication.DoesNotExist:
            raise GraphQLError("This Publication does not exist")
        if publication.is_banned:
            raise GraphQLError("This Publication has been banned. You can no longer access it")
        Vote.objects.create(publication=publication, user=user, type=type)
        publication.refresh_from_db()
        return CreateVote(vote_count=publication.vote_count)

class UpdateVote(graphene.Mutation):
    class Arguments:
        publication_id = graphene.Int(required=True)
        type = graphene.Int(required=True)

    vote_count = graphene.Int()

    def mutate(root, info, publication_id, type):
        user = info.context.user
        if not user.is_authenticated:
            return UpdateVote(vote_count=None)
        if (abs(type) > 1 and not user.is_staff) or not type:
            raise GraphQLError("You are not allowed to have such a weight for your vote")
        try:
            vote = Vote.objects.get(publication_id=publication_id, user=user)
        except Vote.DoesNotExist:
            raise GraphQLError("This Vote does not exist")
        publication = Publication.objects.get(id=publication_id)
        if publication.is_banned:
            raise GraphQLError("This Publication has been banned. You can no longer access it")
        if vote.type == type:
            return UpdateVote(vote_count=None)
        vote.type = type
        vote.save()
        publication.refresh_from_db()
        return UpdateVote(vote_count=publication.vote_count)

class DeleteVote(graphene.Mutation):
    class Arguments:
        publication_id = graphene.Int(required=True)

    vote_count = graphene.Int()

    def mutate(root, info, publication_id):
        user = info.context.user
        if not user.is_authenticated:
            return DeleteVote(vote_count=None)
        try:
            vote = Vote.objects.get(publication_id=publication_id, user=user)
        except Vote.DoesNotExist:
            raise GraphQLError("This Vote does not exist")
        publication = Publication.objects.get(id=publication_id)
        if publication.is_banned:
            raise GraphQLError("This Publication has been banned. You can no longer access it")
        vote.delete()
        return DeleteVote(vote_count=publication.vote_count)

class CreateComment(graphene.Mutation):
    class Arguments:
        publication = graphene.Int(required=True)  
        parent = graphene.Int()
        text = graphene.String(required=True)

    comment = graphene.Field(CommentType)

    def mutate(self, info, publication, text, parent=None):
        author = info.context.user
        if not author.is_authenticated:
            raise GraphQLError("You must be logged in to comment")
        try:
            publication_instance = Publication.objects.get(id=publication)
        except Publication.DoesNotExist:
            raise GraphQLError("This Publication does not exist")
        if publication_instance.is_banned:
            raise GraphQLError("This Publication has been banned. You can no longer access it")
        parent_comment = None
        if parent:
            try:
                parent_comment = Comment.objects.get(id=parent)
            except Comment.DoesNotExist:
                raise GraphQLError("This parent Comment does not exist")
            if not parent_comment.publication == publication_instance:
                raise GraphQLError("The parent comment's publication does not match this commment's")
        comment = Comment(publication = publication_instance, parent=parent_comment, text=text, author=author)
        comment.save()
        return CreateComment(comment=comment)
    
class Mutation(graphene.ObjectType):
    create_publication = CreatePublication.Field()
    update_publication = UpdatePublication.Field()
    delete_publication = DeletePublication.Field()
    create_view = CreateView.Field()
    create_vote = CreateVote.Field()
    update_vote = UpdateVote.Field()
    delete_vote = DeleteVote.Field()
    create_comment = CreateComment.Field()

