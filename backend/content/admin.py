from django.contrib import admin
from .models import Audio, Tag, Publication, View, Vote, Follower, Comment

admin.site.register(Audio)
admin.site.register(Tag)
admin.site.register(Publication)
admin.site.register(View)
admin.site.register(Vote)
admin.site.register(Follower)
admin.site.register(Comment)

