from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from unittest.mock import patch, MagicMock
import os
import tempfile
from PIL import Image
import io
import subprocess

from ..validators import (
    validate_extension,
    validate_image_extension,
    validate_audio_extension,
    validate_mime,
    validate_image_mime,
    validate_audio_mime,
    validate_size,
    validate_image_size,
    validate_audio_size,
    validate_image_dimensions,
    validate_image_corruption,
    validate_audio_corruption,
    validate_image,
    validate_audio
)

class ValidatorsTestCase(TestCase):
    def setUp(self):
        # Create test image files
        self.valid_jpeg = self._create_test_image('test_image.jpg', 'JPEG')
        self.valid_png = self._create_test_image('test_image.png', 'PNG')
        self.large_image = self._create_test_image('large_image.jpg', 'JPEG', width=6000, height=6000)
        self.oversized_image = self._create_test_image('oversized.jpg', 'JPEG', size=6 * 1024 * 1024)
        
        # Create test audio file
        self.valid_mp3 = SimpleUploadedFile(
            'test_audio.mp3',
            b'dummy audio content',
            content_type='audio/mpeg'
        )
        self.invalid_ext_audio = SimpleUploadedFile(
            'test_audio.wav',
            b'dummy audio content',
            content_type='audio/wav'
        )
        self.oversized_audio = SimpleUploadedFile(
            'large_audio.mp3',
            b'dummy' * 11 * 1024 * 1024,  # 11MB approximately
            content_type='audio/mpeg'
        )

    def _create_test_image(self, filename, format, width=100, height=100, size=None):
        """Helper method to create test images with specified parameters"""
        image = Image.new('RGB', (width, height), color='red')
        image_io = io.BytesIO()
        image.save(image_io, format=format)
        
        # If a specific size is needed (for testing file size limits)
        if size:
            image_io.seek(0, os.SEEK_END)
            current_size = image_io.tell()
            image_io.write(b'0' * (size - current_size))
        
        image_io.seek(0)
        
        content_type = f'image/{format.lower()}'
        if format == 'JPEG':
            content_type = 'image/jpeg'
            
        return SimpleUploadedFile(
            filename,
            image_io.getvalue(),
            content_type=content_type
        )
        
    def tearDown(self):
        # Clean up any created files
        pass

    # Test validate_extension
    def test_validate_extension_valid(self):
        # Should not raise an exception
        validate_extension(self.valid_jpeg, ["jpg", "jpeg", "png"])
        validate_extension(self.valid_png, ["jpg", "jpeg", "png"])

    def test_validate_extension_invalid(self):
        with self.assertRaises(ValidationError):
            validate_extension(self.valid_jpeg, ["gif", "png"])

    # Test validate_image_extension
    def test_validate_image_extension_valid(self):
        validate_image_extension(self.valid_jpeg)
        validate_image_extension(self.valid_png)

    def test_validate_image_extension_invalid(self):
        invalid_image = SimpleUploadedFile("test.gif", b"dummy content", content_type="image/gif")
        with self.assertRaises(ValidationError):
            validate_image_extension(invalid_image)

    # Test validate_audio_extension
    def test_validate_audio_extension_valid(self):
        validate_audio_extension(self.valid_mp3)

    def test_validate_audio_extension_invalid(self):
        with self.assertRaises(ValidationError):
            validate_audio_extension(self.invalid_ext_audio)

    # Test validate_mime with mocked Magic
    @patch('content.validators.Magic')
    def test_validate_mime_valid(self, mock_magic):
        # Set up the magic mock
        magic_instance = MagicMock()
        magic_instance.from_buffer.return_value = "image/jpeg"
        mock_magic.return_value = magic_instance
        
        validate_mime(self.valid_jpeg, ["image/jpeg"])

    @patch('content.validators.Magic')
    def test_validate_mime_invalid(self, mock_magic):
        # Set up the magic mock
        magic_instance = MagicMock()
        magic_instance.from_buffer.return_value = "image/gif"
        mock_magic.return_value = magic_instance
        
        with self.assertRaises(ValidationError):
            validate_mime(self.valid_jpeg, ["image/jpeg", "image/png"])

    # Test validate_image_mime with mocked function call
    @patch('content.validators.validate_mime')
    def test_validate_image_mime(self, mock_validate_mime):
        validate_image_mime(self.valid_jpeg)
        mock_validate_mime.assert_called_once_with(self.valid_jpeg, ("image/jpeg", "image/png"))

    # Test validate_audio_mime with mocked function call
    @patch('content.validators.validate_mime')
    def test_validate_audio_mime(self, mock_validate_mime):
        validate_audio_mime(self.valid_mp3)
        mock_validate_mime.assert_called_once_with(self.valid_mp3, ("audio/mpeg", "application/octet-stream"))

    # Test validate_size
    def test_validate_size_valid(self):
        file = SimpleUploadedFile("test.txt", b"small content")
        validate_size(file, 1024 * 1024)  # 1MB max

    def test_validate_size_invalid(self):
        large_file = SimpleUploadedFile("test.txt", b"x" * (2 * 1024 * 1024))  # 2MB
        with self.assertRaises(ValidationError):
            validate_size(large_file, 1 * 1024 * 1024)  # 1MB max

    # Test validate_image_size
    def test_validate_image_size_valid(self):
        validate_image_size(self.valid_jpeg)

    def test_validate_image_size_invalid(self):
        with self.assertRaises(ValidationError):
            validate_image_size(self.oversized_image)

    # Test validate_audio_size
    def test_validate_audio_size_valid(self):
        validate_audio_size(self.valid_mp3)

    def test_validate_audio_size_invalid(self):
        with self.assertRaises(ValidationError):
            validate_audio_size(self.oversized_audio)

    # Test validate_image_dimensions
    def test_validate_image_dimensions_valid(self):
        validate_image_dimensions(self.valid_jpeg)

    def test_validate_image_dimensions_invalid(self):
        with self.assertRaises(ValidationError):
            validate_image_dimensions(self.large_image)

    # Test validate_image_corruption
    @patch('PIL.Image.open')
    def test_validate_image_corruption_valid(self, mock_image_open):
        mock_img = MagicMock()
        mock_image_open.return_value = mock_img
        
        validate_image_corruption(self.valid_jpeg)
        mock_img.verify.assert_called_once()

    @patch('PIL.Image.open')
    def test_validate_image_corruption_invalid(self, mock_image_open):
        mock_img = MagicMock()
        mock_img.verify.side_effect = Exception("Invalid image file")
        mock_image_open.return_value = mock_img
        
        with self.assertRaises(Exception):
            validate_image_corruption(self.valid_jpeg)

    # Test the comprehensive validate_image function
    @patch('content.validators.validate_image_extension')
    @patch('content.validators.validate_image_mime')
    @patch('content.validators.validate_image_size')
    @patch('content.validators.validate_image_dimensions')
    @patch('content.validators.validate_image_corruption')
    def test_validate_image(self, mock_corruption, mock_dimensions, mock_size, mock_mime, mock_extension):
        validate_image(self.valid_jpeg)
        
        mock_extension.assert_called_once_with(self.valid_jpeg)
        mock_mime.assert_called_once_with(self.valid_jpeg)
        mock_size.assert_called_once_with(self.valid_jpeg)
        mock_dimensions.assert_called_once_with(self.valid_jpeg)
        mock_corruption.assert_called_once_with(self.valid_jpeg)

    # Test the comprehensive validate_audio function
    @patch('content.validators.validate_audio_extension')
    @patch('content.validators.validate_audio_mime')
    @patch('content.validators.validate_audio_size')
    @patch('content.validators.validate_audio_corruption')
    def test_validate_audio(self, mock_corruption, mock_size, mock_mime, mock_extension):
        validate_audio(self.valid_mp3)
        
        mock_extension.assert_called_once_with(self.valid_mp3)
        mock_mime.assert_called_once_with(self.valid_mp3)
        mock_size.assert_called_once_with(self.valid_mp3)
        mock_corruption.assert_called_once_with(self.valid_mp3)