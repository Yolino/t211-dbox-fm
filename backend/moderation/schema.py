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

class ReportPublicationType(DjangoObjectType):
    class Meta:
        model = ReportPublication
        fields = ("id", "reporter", "reported_publication", "is_reviewed")

class ReportCommentType(DjangoObjectType):
    class Meta:
        model = ReportComment
        fields = ("id", "reporter", "reported_comment", "is_reviewed")

class ReportedUserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ("id", "username", "is_active")

    report_count = graphene.Int()
    def resolve_report_count(root, info):
        return root.report_count

class ReportedPublicationType(DjangoObjectType):
    class Meta:
        model = Publication
        fields = ("id", "title", "author", "cover", "description", "is_banned")

    report_count = graphene.Int()
    def resolve_report_count(root, info):
        return root.report_count

class ReportedCommentType(DjangoObjectType):
    class Meta:
        model = Comment
        fields = ("id", "publication", "author", "text", "is_banned")

    report_count = graphene.Int()
    def resolve_report_count(root, info):
        return root.report_count

class Query(graphene.ObjectType):
    user_reports = graphene.List(ReportUserType, reported_id=graphene.Int(required=True))
    publication_reports = graphene.List(ReportPublicationType, reported_id=graphene.Int(required=True))
    comment_reports = graphene.List(ReportCommentType, reported_id=graphene.Int(required=True))
    reported_users = graphene.List(ReportedUserType)
    reported_publications = graphene.List(ReportedPublicationType)
    reported_comments = graphene.List(ReportedCommentType)

    def resolve_user_reports(root, info, reported_id):
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.view_reportuser")):
            raise GraphQLError("You do not have permission to view User reports")
        return ReportUser.objects.filter(reported_user_id=reported_id, is_reviewed=False)

    def resolve_publication_reports(root, info, reported_id):
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.view_reportpublication")):
            raise GraphQLError("You do not have permission to view Publication reports")
        return ReportPublication.objects.filter(reported_publication_id=reported_id, is_reviewed=False)

    def resolve_comment_reports(root, info, reported_id):
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.view_reportcomment")):
            raise GraphQLError("You do not have permission to view Comment reports")
        return ReportComment.objects.filter(reported_comment_id=reported_id, is_reviewed=False)

    def resolve_reported_users(root, info):
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.view_reportuser")):
            raise GraphQLError("You do not have permission to view User reports")
        return User.objects.filter(reports_received__is_reviewed=False).annotate(report_count=models.Count("reports_received", filter=models.Q(reports_received__is_reviewed=False))).distinct()

    def resolve_reported_publications(root, info):
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.view_reportpublication")):
            raise GraphQLError("You do not have permission to view Publication reports")
        return Publication.objects.filter(reportpublication__is_reviewed=False).annotate(report_count=models.Count("reportpublication", filter=models.Q(reportpublication__is_reviewed=False))).distinct()

    def resolve_reported_comments(root, info):
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.view_reportcomment")):
            raise GraphQLError("You do not have permission to view Comment reports")
        return Comment.objects.filter(reportcomment__is_reviewed=False).annotate(report_count=models.Count("reportcomment", filter=models.Q(reportcomment__is_reviewed=False))).distinct()

class CreateReportUser(graphene.Mutation):
    class Arguments:
        reported_id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, reported_id):
        reporter = info.context.user
        if not reporter.is_authenticated:
            raise GraphQLError("You must be logged in to report a User")
        try:
            reported_user = User.objects.get(id=reported_id)
        except User.DoesNotExist:
            raise GraphQLError("This User does not exist")
        if not reported_user.is_active:
            raise GraphQLError("You cannot report a User that is already banned")
        if ReportUser.objects.filter(reporter=reporter, reported_user=reported_user).exists():
            return CreateReportUser(success=False)
        report_user = ReportUser(reporter=reporter, reported_user=reported_user)
        report_user.save()
        return CreateReportUser(success=True)

class CreateReportPublication(graphene.Mutation):
    class Arguments:
        reported_id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, reported_id):
        reporter = info.context.user
        if not reporter.is_authenticated:
            raise GraphQLError("You must be logged in to report a Publication")
        try:
            reported_publication = Publication.objects.get(id=reported_id)
        except Publication.DoesNotExist:
            raise GraphQLError("This Publication does not exist")
        if reported_publication.is_banned:
            raise GraphQLError("You cannot report a Publication that is already banned")
        if ReportPublication.objects.filter(reporter=reporter, reported_publication=reported_publication):
            return CreateReportPublication(success=False)
        report_publication = ReportPublication(reporter=reporter, reported_publication=reported_publication)
        report_publication.save()
        return CreateReportPublication(success=True)

class CreateReportComment(graphene.Mutation):
    class Arguments:
        reported_id = graphene.Int(required=True)

    success = graphene.Boolean()

    def mutate(root, info, reported_id):
        reporter = info.context.user
        if not reporter.is_authenticated:
            raise GraphQLError("You must be logged in to report a Comment")
        try:
            reported_comment = Comment.objects.get(id=reported_id)
        except Comment.DoesNotExist:
            raise GraphQLError("This Comment does not exist")
        if reported_comment.is_banned:
            raise GraphQLError("You cannot report a Comment that is already banned")
        if ReportComment.objects.filter(reporter=reporter, reported_comment=reported_comment).exists():
            return CreateReportComment(success=False)
        report_comment = ReportComment(reporter=reporter, reported_comment=reported_comment)
        report_comment.save()
        return CreateReportComment(success=True)

class ReviewReportUser(graphene.Mutation):
    class Arguments:
        report_user_id = graphene.Int(required=True)
        is_safe = graphene.Boolean(required=True)

    success = graphene.Boolean()

    def mutate(root, info, report_user_id, is_safe):
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.change_reportuser")):
            raise GraphQLError("You do not have permission to change User reports")
        try:
            report_user = ReportUser.objects.get(id=report_user_id)
        except ReportUser.DoesNotExist:
            raise GraphQLError("This ReportUser does not exist")
        if report_user.is_reviewed:
            raise GraphQLError("This ReportUser has already been reviewed")
        if not is_safe:
            user = report_user.reported_user
            user.is_active = False
            user.save()
        report_user.is_reviewed = True
        report_user.save()
        return ReviewReportUser(success=True)

class ReviewReportPublication(graphene.Mutation):
    class Arguments:
        report_publication_id = graphene.Int(required=True)
        is_safe = graphene.Boolean(required=True)

    success = graphene.Boolean()

    def mutate(root, info, report_publication_id, is_safe):
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.change_reportpublication")):
            raise GraphQLError("You do not have permission to change Publication reports")
        try:
            report_publication = ReportPublication.objects.get(id=report_publication_id)
        except ReportPublication.DoesNotExist:
            raise GraphQLError("This ReportPublication does not exist")
        if report_publication.is_reviewed:
            raise GraphQLError("This ReportPublication has already been reviewed")
        if not is_safe:
            publication = report_publication.reported_publication
            publication.is_banned = True
            publication.save()
        report_publication.is_reviewed = True
        report_publication.save()
        return ReviewReportPublication(success=True)

class ReviewReportComment(graphene.Mutation):
    class Arguments:
        report_comment_id = graphene.Int(required=True)
        is_safe = graphene.Boolean(required=True)

    success = graphene.Boolean()

    def mutate(root, info, report_comment_id, is_safe):
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.change_reportcomment")):
            raise GraphQLError("You do not have permission to change Comment reports")
        try:
            report_comment = ReportComment.objects.get(id=report_comment_id)
        except ReportComment.DoesNotExist:
            raise GraphQLError("This ReportComment does not exist")
        if report_comment.is_reviewed:
            raise GraphQLError("This ReportComment has already been reviewed")
        if not is_safe:
            comment = report_comment.reported_comment
            comment.is_banned = True
            comment.save()
        report_comment.is_reviewed = True
        report_comment.save()
        return ReviewReportComment(success=True)

class Mutation(graphene.ObjectType):
    create_report_user = CreateReportUser.Field()
    create_report_publication = CreateReportPublication.Field()
    create_report_comment = CreateReportComment.Field()
    review_report_user = ReviewReportUser.Field()
    review_report_publication = ReviewReportPublication.Field()
    review_report_comment = ReviewReportComment.Field()

