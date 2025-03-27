from django.core.exceptions import ValidationError
from django.core.files.images import get_image_dimensions
from magic import Magic
from PIL import Image
import os
import tempfile
import subprocess

def validate_extension(file, allowed_extensions):
    extension = file.name.split(".")[-1].lower()
    if extension not in allowed_extensions:
        raise ValidationError(f"Unsupported file extension, expected {allowed_extensions}")

def validate_image_extension(image):
    validate_extension(image, ("jpeg", "jpg", "png"))

def validate_audio_extension(audio):
    validate_extension(audio, ("mp3",))

def validate_mime(file, allowed_mime_types):
    mime = Magic(mime=True)
    mime_type = mime.from_buffer(file.read(2048))
    file.seek(0)
    if mime_type not in allowed_mime_types:
        raise ValidationError(f"Invalid MIME type: {mime_type}, expected {allowed_mime_types}")

def validate_image_mime(image):
    validate_mime(image, ("image/jpeg", "image/png"))

def validate_audio_mime(audio):
    validate_mime(audio, ("audio/mpeg", "application/octet-stream"))

def validate_size(file, max_size):
    if file.size > max_size:
        raise ValidationError(f"File too large, expected {max_size / (1024*1024)}MB maximum")

def validate_image_size(image):
    validate_size(image, 5 * 1024 * 1024)

def validate_audio_size(audio):
    validate_size(audio, 10 * 1024 * 1024)

def validate_image_dimensions(image, max_width=5000, max_height=5000):
    width, height = get_image_dimensions(image)
    if width > max_width or height > max_height:
        raise ValidationError(f"Image dimensions too large, expected {max_width}x{max_height} maximum")

def validate_image_corruption(image):
    img = Image.open(image)
    img.verify()

def validate_audio_corruption(audio):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
        tmp_path = tmp_file.name
        tmp_file.write(audio.read())
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=codec_name", "-of", "csv=p=0", tmp_path],
            capture_output=True,
            text=True,
            check=True
        )
        return "mp3" in result.stdout.lower()
    except subprocess.CalledProcessError:
        return False
    finally:
        os.remove(tmp_path)

def validate_image(image):
    validate_image_extension(image)
    validate_image_mime(image)
    validate_image_size(image)
    validate_image_dimensions(image)
    validate_image_corruption(image)

def validate_audio(audio):
    validate_audio_extension(audio)
    validate_audio_mime(audio)
    validate_audio_size(audio)
    validate_audio_corruption(audio)
