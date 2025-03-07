import graphene
from users.schema import Mutation as UsersMutation
from content.schema import Query as ContentQuery
from moderation.schema import Query as ModerationQuery

class Query(ContentQuery, ModerationQuery):
    pass

class Mutation(UsersMutation):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)

