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

class ReportUnion(graphene.Union):
    class Meta:
        types = (ReportUserType, ReportPublicationType, ReportCommentType)

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

class ReportedContentType(graphene.ObjectType):
    users = graphene.List(ReportedUserType)
    publications = graphene.List(ReportedPublicationType)
    comments = graphene.List(ReportedCommentType)

class Query(graphene.ObjectType):
    reporters = graphene.List(ReportUnion, reported_id=graphene.Int(required=True), content_type=graphene.String(required=True))
    reported_content = graphene.Field(ReportedContentType)
 
    def resolve_reporters(root, info, reported_id, content_type):
        if content_type == "user":
            return ReportUser.objects.filter(reported_user_id=reported_id, is_reviewed=False)
        if content_type == "publication":
            return ReportPublication.objects.filter(reported_publication_id=reported_id, is_reviewed=False)
        if content_type == "comment":
            return ReportComment.objects.filter(reported_comment_id=reported_id, is_reviewed=False)
        raise GraphQLError("This Report either does not exist or has already been reviewed")

    def resolve_reported_content(root, info):
        user = info.context.user
        if not (user.is_authenticated and user.has_perm("moderation.view_reportuser") and user.has_perm("moderation.view_reportpublication") and user.has_perm("moderation.view_reportcomment")):
            raise GraphQLError("You do not have permission to view Comment reports")

        result = {}
        result["users"] = User.objects.filter(reports_received__is_reviewed=False).annotate(report_count=models.Count("reports_received", filter=models.Q(reports_received__is_reviewed=False))).distinct()
        result["publications"] = Publication.objects.filter(reportpublication__is_reviewed=False).annotate(report_count=models.Count("reportpublication", filter=models.Q(reportpublication__is_reviewed=False))).distinct()
        result["comments"] = Comment.objects.filter(reportcomment__is_reviewed=False).annotate(report_count=models.Count("reportcomment", filter=models.Q(reportcomment__is_reviewed=False))).distinct()
        return result

class CreateReport(graphene.Mutation):
    class Arguments:
        reported_id = graphene.Int(required=True)
        content_type = graphene.String(required=True)

    success = graphene.Boolean()

    def mutate(root, info, reported_id, content_type):
        reporter = info.context.user
        if not reporter.is_authenticated:
            raise GraphQLError("You must be logged in to report a Comment")

        if content_type == "user":
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

        if content_type == "publication":
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
            return CreateReport(success=True)

        if content_type == "comment":
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
            return CreateReport(success=True)

        raise GraphQLError("Received unexpected content type argument")

class ReviewReport(graphene.Mutation):
    class Arguments:
        report_id = graphene.Int(required=True)
        report_type = graphene.String(required=True)
        is_safe = graphene.Boolean(required=True)

    success = graphene.Boolean()

    def mutate(root, info, report_id, report_type, is_safe):
        user = info.context.user
        if not (user.is_authenticated and user.has_perm("moderation.change_reportuser") and user.has_perm("moderation.change_reportpublication") and user.has_perm("moderation.change_reportcomment")):
            raise GraphQLError("You do not have permission to review Reports")

        if report_type == "user":
            try:
                report_user = ReportUser.objects.get(id=report_id)
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
            return ReviewReport(success=True)

        if report_type == "publication":
            try:
                report_publication = ReportPublication.objects.get(id=report_id)
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
            return ReviewReport(success=True)

        if report_type == "comment":
            try:
                report_comment = ReportComment.objects.get(id=report_id)
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
            return ReviewReport(success=True)

        raise GraphQLError("Received unexpected content type argument")

class Mutation(graphene.ObjectType):
    create_report = CreateReport.Field()
    review_report = ReviewReport.Field()

