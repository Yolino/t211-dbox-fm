import graphene
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

class ReportedPublicationType(DjangoObjectType):
    class Meta:
        model = Publication
        fields = ("id", "author", "cover", "description", "is_banned")
    
    report_count = graphene.Int()
    def resolve_report_count(root, info):
        pass

class ReportCommentType(DjangoObjectType):
    class Meta:
        model = ReportCpùùent
        fields = ("id", "reporter", "reported_comment", "is_reviewed")

class Query(graphene.ObjectType):
    reported_publications = graphene.List(graphene.NonNull(ReportedPublicationType))

