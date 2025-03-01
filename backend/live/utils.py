from django.conf import settings
from django.core.files import File
import os
from pydub import AudioSegment
import numpy as np

def generate_low_quality_audio(input_path):
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_frame_rate(8000).set_channels(1).set_sample_width(1)
    pcm_samples = np.frombuffer(audio.raw_data, dtype=np.uint8)
    pwm_samples = pcm_samples.astype(np.uint16) << 8

    return ",".join(map(str, pwm_samples))

