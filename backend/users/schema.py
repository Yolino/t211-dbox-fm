import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model, authenticate, login
from django.contrib.auth.password_validation import validate_password

User = get_user_model()
class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ("id", "username", "email")

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

    user = graphene.Field(UserType)

    def mutate(root, info, username, password):
        if info.context.user.is_authenticated:
            raise GraphQLError("You cannot log in if you are already authenticated")
        user = authenticate(username=username, password=password)
        if not user:
            raise GraphQLError("Invalid credentials")
        login(info.context, user)
        return LoginUser(user=user)

class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    login_user = LoginUser.Field()

schema = graphene.Schema(mutation=Mutation)

