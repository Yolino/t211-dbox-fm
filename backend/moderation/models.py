from django.db import models
from django.contrib.auth.models import User
from content.models import Publication, Comment

class ReportUser(models.Model):
    reporter = models.ForeignKey(User, related_name="reporter", on_delete=models.PROTECT)
    reported_user = models.ForeignKey(User, related_name="reported_user", on_delete=models.PROTECT)
    is_reviewed = models.BooleanField(default=False)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["reporter", "reported_user"], name="unique_report_user"),
        ]

class ReportPublication(models.Model):
    reporter = models.ForeignKey(User, on_delete=models.PROTECT)
    reported_publication = models.ForeignKey(Publication, on_delete=models.PROTECT)
    is_reviewed = models.BooleanField(default=False)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["reporter", "reported_publication"], name="unique_report_publication"),
        ]

class ReportComment(models.Model):
    reporter = models.ForeignKey(User, on_delete=models.PROTECT)
    reported_comment = models.ForeignKey(Comment, on_delete=models.PROTECT)
    is_reviewed = models.BooleanField(default=False)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["reporter", "reported_comment"], name="unique_report_comment"),
        ]

