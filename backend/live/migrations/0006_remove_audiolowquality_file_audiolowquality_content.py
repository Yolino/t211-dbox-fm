# Generated by Django 5.1.6 on 2025-03-01 06:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('live', '0005_alter_scheduling_audio_low_quality'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='audiolowquality',
            name='file',
        ),
        migrations.AddField(
            model_name='audiolowquality',
            name='content',
            field=models.TextField(blank=True, null=True),
        ),
    ]
