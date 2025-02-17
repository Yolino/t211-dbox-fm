from django.db import models

class Test(models.Model):
    name = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
