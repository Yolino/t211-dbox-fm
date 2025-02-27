from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class Audio(models.Model):
    file = models.FileField(upload_to="audio/")

class Tag(models.Model):
    name = models.CharField(max_length=30)

class Publication(models.Model):
    title = models.CharField(max_length=100)
    author = models.ForeignKey(User, on_delete=models.PROTECT)
    tag = models.ForeignKey(Tag, on_delete=models.PROTECT)
    description = models.CharField(max_length=255, null=True, blank=True)
    audio = models.OneToOneField(Audio, on_delete=models.PROTECT)
    view_count = models.PositiveIntegerField(default=0)
    vote_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    is_banned = models.BooleanField(default=False)

class View(models.Model):
    publication = models.ForeignKey(Publication, on_delete=models.PROTECT)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["publication", "user"], name="unique_view"),
        ]

class Vote(models.Model):
    publication = models.ForeignKey(Publication, on_delete=models.PROTECT)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    type = models.SmallIntegerField()
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["publication", "user"], name="unique_vote"),
        ]

class Follower(models.Model):
    follower = models.ForeignKey(User, related_name="follower", on_delete=models.PROTECT)
    following = models.ForeignKey(User, related_name="following", on_delete=models.PROTECT)

class Comment(models.Model):
    publication = models.ForeignKey(Publication, on_delete=models.PROTECT)
    author = models.ForeignKey(User, on_delete=models.PROTECT)
    parent = models.ForeignKey("self", on_delete=models.PROTECT, null=True, blank=True)
    text = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    is_banned = models.BooleanField(default=False)

