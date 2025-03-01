from django.contrib import admin
from django.urls import path, include
from graphene_django.views import GraphQLView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("graphql/", GraphQLView.as_view(graphiql=True)),
    path("api/", include("content.urls")),
    path("api/", include("live.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

