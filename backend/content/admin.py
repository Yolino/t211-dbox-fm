from django.contrib import admin
from .models import Tag, Publication, View, Vote, Follower, Comment

admin.site.register(Tag)
admin.site.register(Publication)
admin.site.register(View)
admin.site.register(Vote)
admin.site.register(Follower)
admin.site.register(Comment)

