from django.db import models
from django.contrib.auth.models import User
from content.models import Publication, Comment

class ReportUser(models.Model):
    reporter = models.ForeignKey(User, related_name="reports_created", on_delete=models.PROTECT)
    reported_user = models.ForeignKey(User, related_name="reports_received", on_delete=models.PROTECT)
    is_reviewed = models.BooleanField(default=False)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["reporter", "reported_user"], name="unique_report_user"),
        ]
    def __str__(self):
        return f"{self.reported_user} reported by {self.reporter}"

class ReportPublication(models.Model):
    reporter = models.ForeignKey(User, on_delete=models.PROTECT)
    reported_publication = models.ForeignKey(Publication, on_delete=models.PROTECT)
    is_reviewed = models.BooleanField(default=False)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["reporter", "reported_publication"], name="unique_report_publication"),
        ]

    def __str__(self):
        return f"{self.reported_publication} reported by {self.reporter}"

class ReportComment(models.Model):
    reporter = models.ForeignKey(User, on_delete=models.PROTECT)
    reported_comment = models.ForeignKey(Comment, on_delete=models.PROTECT)
    is_reviewed = models.BooleanField(default=False)
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["reporter", "reported_comment"], name="unique_report_comment"),
        ]

    def __str__(self):
        return f"{self.reported_comment} reported by {self.reporter}"

