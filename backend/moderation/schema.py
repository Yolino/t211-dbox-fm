import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from django.db import models
from django.contrib.auth.models import User
from .models import ReportUser, ReportPublication, ReportComment
from content.models import Publication, Comment

class ReportUserType(DjangoObjectType):
    class Meta:
        model = ReportUser
        fields = ("id", "reporter", "reported_user", "is_reviewed")

class ReportedUserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ("id", "username", "is_active")

    report_count = graphene.Int()
    def resolve_report_count(root, info):
        return root.report_count

class ReportPublicationType(DjangoObjectType):
    class Meta:
        model = ReportPublication
        fields = ("id", "reporter", "reported_publication", "is_reviewed")

class ReportedPublicationType(DjangoObjectType):
    class Meta:
        model = Publication
        fields = ("id", "title", "author", "cover", "description", "is_banned")

    report_count = graphene.Int()
    def resolve_report_count(root, info):
        return root.report_count

class ReportCommentType(DjangoObjectType):
    class Meta:
        model = ReportComment
        fields = ("id", "reporter", "reported_comment", "is_reviewed")

class ReportedCommentType(DjangoObjectType):
    class Meta:
        model = Comment
        fields = ("id", "publication", "author", "text", "is_banned")

    report_count = graphene.Int()
    def resolve_report_count(root, info):
        return root.report_count

class Query(graphene.ObjectType):
    reported_users = graphene.List(ReportedUserType)
    reported_publications = graphene.List(ReportedPublicationType)
    reported_comments = graphene.List(ReportedCommentType)

    def resolve_reported_users(root, info):
        if not info.context.user.has_perm("moderation.view_reportuser"):
            raise GraphQLError("You do not have permission to view User reports")
        return User.objects.filter(reports_received__is_reviewed=False).annotate(report_count=models.Count("reports_received", filter=models.Q(reports_received__is_reviewed=False))).distinct()

    def resolve_reported_publications(root, info):
        if not info.context.user.has_perm("moderation.view_reportpublication"):
            raise GraphQLError("You do not have permission to view Publication reports")
        return Publication.objects.filter(reportpublication__is_reviewed=False).annotate(report_count=models.Count("reportpublication", filter=models.Q(reportpublication__is_reviewed=False))).distinct()

    def resolve_reported_comments(root, info):
        if not info.context.user.has_perm("moderation.view_reportcomment"):
            raise GraphQLError("You do not have permission to view Comment reports")
        return Comment.objects.filter(reportcomment__is_reviewed=False).annotate(report_count=models.Count("reportcomment", filter=models.Q(reportcomment__is_reviewed=False))).distinct()

