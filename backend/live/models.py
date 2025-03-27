from django.db import models
from content.models import Publication

class Scheduling(models.Model):
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE)
    time = models.DateTimeField()

    def __str__(self):
        return f"{self.time} : {self.publication}"

