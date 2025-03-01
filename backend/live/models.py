from django.db import models
from content.models import Publication
from .utils import generate_low_quality_audio

class AudioLowQuality(models.Model):
    content = models.TextField(blank=True, null=True)

class Scheduling(models.Model):
    audio_low_quality = models.OneToOneField(AudioLowQuality, on_delete=models.CASCADE, blank=True, null=True)
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE)
    time = models.DateTimeField()

    def __str__(self):
        return f"{self.time} - {self.publication.title}"

    def save(self, *args, **kwargs):
        if not self.audio_low_quality:
            audio_content = generate_low_quality_audio(self.publication.audio.file.path)
            if audio_content:
                self.audio_low_quality, _ = AudioLowQuality.objects.get_or_create(content=audio_content)
        super().save(*args, **kwargs)

