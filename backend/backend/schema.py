import graphene
from users.schema import Mutation as UsersMutation
from content.schema import Query as ContentQuery
from moderation.schema import Query as ModerationQuery
from content.schema import Mutation as ContentMutation

class Query(ContentQuery, ModerationQuery):
    pass

class Mutation(UsersMutation , ContentMutation):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)

