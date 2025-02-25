import graphene
from content.schema import Query as ContentQuery
from moderation.schema import Query as ModerationQuery

class Query(ContentQuery, ModerationQuery):
    pass

schema = graphene.Schema(query=Query)
