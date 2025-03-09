import graphene
from users.schema import Mutation as UsersMutation
from users.schema import Query as UsersQuery
from content.schema import Query as ContentQuery
from moderation.schema import Query as ModerationQuery
from content.schema import Mutation as ContentMutation

class Query(UsersQuery, ContentQuery, ModerationQuery):
    pass

class Mutation(UsersMutation , ContentMutation):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)