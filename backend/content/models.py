from django.db import models, transaction
from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from .validators import validate_image, validate_audio

class Tag(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name

class Publication(models.Model):
    title = models.CharField(max_length=100)
    author = models.ForeignKey(User, on_delete=models.PROTECT)
    cover = models.ImageField(upload_to="cover/", validators=[validate_image], null=True, blank=True)
    tag = models.ForeignKey(Tag, on_delete=models.PROTECT)
    description = models.CharField(max_length=255, null=True, blank=True)
    audio = models.FileField(upload_to="audio/", validators=[validate_audio])
    view_count = models.PositiveIntegerField(default=0)
    vote_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    is_banned = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.author} - {self.title}"

class View(models.Model):
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["publication", "user"], name="unique_view"),
        ]
   
    def save(self, *args, **kwargs):
        with transaction.atomic():
            super().save(*args, **kwargs)
            self.publication.view_count += 1
            self.publication.save()

    def delete(self, *args, **kwargs):
        with transaction.atomic():
            self.publication.view_count -= 1
            self.publication.save()
            super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.publication} : {self.user}"

class Vote(models.Model):
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    type = models.SmallIntegerField()
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["publication", "user"], name="unique_vote"),
        ]

    def save(self, *args, **kwargs):
        with transaction.atomic():
            super().save(*args, **kwargs)
            self.publication.vote_count += self.type
            self.publication.save()

    def delete(self, *args, **kwargs):
        with transaction.atomic():
            self.publication.vote_count -= self.type
            self.publication.save()
            super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.publication} : {self.type} - {self.user}"

class Follower(models.Model):
    follower = models.ForeignKey(User, related_name="follower", on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name="following", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.following} followed by {self.follower}"

class Comment(models.Model):
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.PROTECT)
    parent = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True)
    text = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True, blank=True)
    is_banned = models.BooleanField(default=False)

    def clean(self):
        if self.parent:
            if not self.parent.publication == self.publication:
                raise ValidationError("A Comment can only reply to another within the same Publication")
        super().clean()

    def __str__(self):
        return f"{self.publication} : {self.author} commented '{self.text}'"

