import graphene
import logging
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from content.models import Publication, Comment
from content.schema import PublicationType, CommentType
from .utils import send_verification_email, get_client_ip

logger = logging.getLogger('django.user')

User = get_user_model()

class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ("id", "username", "email", "is_active")

class PrivilegesType(graphene.ObjectType):
    is_logged_in = graphene.Boolean()
    is_moderator = graphene.Boolean()

class ProfileType(graphene.ObjectType):
    user = graphene.Field(UserType)
    publications = graphene.List(graphene.NonNull(PublicationType))
    comments = graphene.List(graphene.NonNull(CommentType))
    is_self = graphene.Boolean()

    def __init__(root, user):
        root.user = user

    def resolve_user(root, info):
        return root.user

    def resolve_publications(root, info):
        user = info.context.user
        result = Publication.objects.filter(author=root.user)
        if not (user.is_authenticated and user.has_perm("moderation.view_reportpublication")):
            result = result.filter(is_banned=False)
        return result.order_by("-id")

    def resolve_comments(root, info):
        user = info.context.user
        result = Comment.objects.filter(author=root.user)
        if not (user.is_authenticated and user.has_perm("moderation.view_reportcomment")):
            result = result.filter(is_banned=False)
        return result.order_by("-id")

    def resolve_is_self(root, info):
        return root.user == info.context.user

class Query(graphene.ObjectType):
    me = graphene.Field(PrivilegesType)
    profile = graphene.Field(ProfileType, username=graphene.String())
    user_lookup = graphene.List(graphene.NonNull(UserType), name=graphene.String(required=True))

    def resolve_me(root, info):
        user = info.context.user
        if user.is_authenticated:
            if user.groups.filter(name="Moderators").exists():
                return PrivilegesType(is_logged_in=True, is_moderator=True)
            return PrivilegesType(is_logged_in=True, is_moderator=False)
        return PrivilegesType(is_logged_in=False, is_moderator=False)

    def resolve_profile(root, info, username=None):
        if username:
            user = User.objects.get(username=username)
        elif info.context.user.is_authenticated:
            user = info.context.user
        else:
            return ProfileType(user=None)
        if not user.is_active and not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.view_reportuser")):
            raise GraphQLError("You are not allowed to view this User")
        if not user:
            raise GraphQLError("User not found")
        return ProfileType(user=user)

    def resolve_user_lookup(root, info, name):
        result = User.objects.filter(username__icontains=name)
        if not (info.context.user.is_authenticated and info.context.user.has_perm("moderation.view_reportuser")):
            result = result.filter(is_active=True)
        return result

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
            logger.warning(f"Invalid password entered while trying to create user {username} from {get_client_ip(info.context)}")
            raise GraphQLError(f"Invalid password: {', '.join(e.messages)}")

        logger.info(f"User {username} with email {email} was successfully created and disabled until confirmed by email")
        user = User(username=username, email=email, is_active=False)
        user.set_password(password)
        user.save()
        send_verification_email(user, info.context)
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
            logger.info(f"{user} (id {user.id}) just connected from {get_client_ip(info.context)}")
            return LoginUser(success=True, user=user)
        else:
            logger.warning(f"Failed authentication with username {username} from {get_client_ip(info.context)}")
            raise GraphQLError("Invalid credentials")

class LogoutUser(graphene.Mutation):
    user = graphene.Field(UserType)

    def mutate(root, info):
        if not info.context.user.is_authenticated:
            raise GraphQLError("You cannot log out if you are not authenticated")
        user = info.context.user
        logger.info(f"{user} (id {user.id}) just disconnected from {get_client_ip(info.context)}")
        logout(info.context)
        return LogoutUser(user=user)

class UpdateUsername(graphene.Mutation):
    class Arguments:
        new_username = graphene.String(required=True)
        password = graphene.String(required=True)

    success = graphene.Boolean()

    def mutate(root, info, new_username, password):
        user = info.context.user
        if not user.is_authenticated:
            logger.warning(f"Unauthenticated username updating attempt from visitor@{get_client_ip(info.context)}")
            raise GraphQLError("You must be logged in to update your username")
        auth = authenticate(username=user.username, password=password)
        if not auth:
            logger.warning(f"Incorrect username-updating validation password from {user}@{get_client_ip(info.context)}")
            raise GraphQLError("Incorrect password")
        if User.objects.filter(username=new_username).exists():
            raise GraphQLError("This username is already taken")

        logger.info(f"User {username} (id {user.id}) successfully changed their username to {new_username}")
        user.username = new_username
        user.save()
        return UpdateUsername(success=True)

class UpdatePassword(graphene.Mutation):
    class Arguments:
        current_password = graphene.String()
        new_password = graphene.String()

    success = graphene.Boolean()

    def mutate(root, info, current_password, new_password):
        user = info.context.user
        if not user.is_authenticated:
            logger.warning(f"Unauthenticated password updating attempt from visitor@{get_client_ip(info.context)}")
            raise GraphQLError("You must be logged in to update your password")
        auth = authenticate(username=user.username, password=current_password)
        if not auth:
            logger.warning(f"Incorrect password-updating validation password from {user}@{get_client_ip(info.context)}")
            raise GraphQLError("Incorrect password")
        if current_password == new_password:
            raise GraphQLError("Passwords must be different")
        try:
            validate_password(new_password)
        except ValidationError as e:
            logger.warning(f"Invalid new password entered by {user}")
            raise GraphQLError(f"Invalid new password: {', '.join(e.messages)}")
        logger.info(f"User {user.username} (id {user.id}) successfully changed their password")
        user.set_password(new_password)
        user.save()
        return UpdatePassword(success=True)

class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    login_user = LoginUser.Field()
    logout_user = LogoutUser.Field()
    update_username = UpdateUsername.Field()
    update_password = UpdatePassword.Field()

