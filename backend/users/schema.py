import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from content.models import Publication
from content.schema import PublicationType

User = get_user_model()

class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ("id", "username", "email")

class ProfileType(graphene.ObjectType):
    user = graphene.Field(UserType)
    publications = graphene.List(graphene.NonNull(PublicationType))
    is_self = graphene.Boolean()

    def __init__(root, user):
        root.user = user

    def resolve_user(root, info):
        return root.user

    def resolve_publications(root, info):
        return Publication.objects.filter(author=root.user)

    def resolve_is_self(root, info):
        return root.user == info.context.user

class CreateUser(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    user = graphene.Field(UserType)

    def mutate(root, info, username, email, password):
        if info.context.user.is_authenticated:
            raise GraphQLError("You cannot create an account if you are already authenticated")
        if User.objects.filter(username=username).exists():
            raise GraphQLError("This username is already taken")
        if User.objects.filter(email=email).exists():
            raise GraphQLError("This email address is already registered")
        try:
            validate_password(password)
        except ValidationError as e:
            raise GraphQLError(f"Invalid password: {', '.join(e.messages)}")

        user = User(username=username, email=email)
        user.set_password(password)
        user.save()
        return CreateUser(user=user)

class LoginUser(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()
    user = graphene.Field(UserType)

    def mutate(root, info, username, password):
        user = info.context.user
        if user.is_authenticated:
            raise GraphQLError("You cannot log in if you are already authenticated")

        user = authenticate(username=username, password=password)
        if user:
            login(info.context, user)
            return LoginUser(success=True, user=user)
        else:
            raise GraphQLError("Invalid credentials")

class LogoutUser(graphene.Mutation):
    user = graphene.Field(UserType)

    def mutate(root, info):
        if not info.context.user.is_authenticated:
            raise GraphQLError("You cannot log out if you are not authenticated")
        user_data = info.context.user
        logout(info.context)
        return LogoutUser(user=user_data)

class Query(graphene.ObjectType):
    me = graphene.Field(UserType)
    profile = graphene.Field(ProfileType, username=graphene.String())

    def resolve_me(root, info):
        user = info.context.user
        if not user.is_authenticated:
            raise GraphQLError("You are not authenticated")
        return user

    def resolve_profile(root, info, username=None):
        if username:
            user = User.objects.get(username=username)
        elif info.context.user.is_authenticated:
            user = info.context.user
        else:
            user = None
        if not user:
            raise GraphQLError("User not found")

        return ProfileType(user=user)

class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    login_user = LoginUser.Field()
    logout_user = LogoutUser.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
