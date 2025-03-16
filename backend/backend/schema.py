import graphene
from users.schema import Query as UsersQuery
from users.schema import Mutation as UsersMutation
from content.schema import Query as ContentQuery
from content.schema import Mutation as ContentMutation
from moderation.schema import Query as ModerationQuery
from live.schema import Query as LiveQuery
from live.schema import Mutation as LiveMutation

class Query(UsersQuery, ContentQuery, ModerationQuery, LiveQuery):
    pass

class Mutation(UsersMutation , ContentMutation, LiveMutation):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
