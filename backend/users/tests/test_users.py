from django.test import TestCase, RequestFactory, override_settings
from django.core import mail
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode, base36_to_int
from django.utils.encoding import force_bytes
from unittest.mock import Mock, patch, ANY
from datetime import timedelta, datetime
from users.utils import send_verification_email, delete_user_after_timeout, token_generator
from users.views import verify_email_view

User = get_user_model()

@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class UserFlowTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass",
            is_active=False
        )
        self.uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        self.token = token_generator._make_token_with_timestamp(
            self.user,
            token_generator._num_seconds(datetime.now()),
            None
        )

    @patch("users.utils.threading.Timer")
    def test_send_verification_email_sends_email_and_starts_timer(self, mock_timer):
        mock_request = Mock()
        mock_request.build_absolute_uri = lambda path: f"http://testserver{path}"

        send_verification_email(self.user, mock_request)

        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.subject, "[DBOX] Verification to your email address")
        self.assertIn("http://testserver/verify-email", email.body)
        self.assertIn("You have 5 minutes to use it", email.body)
        self.assertEqual(email.to, [self.user.email])

        expected_uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        self.assertIn(f"uid={expected_uid}", email.body)
        self.assertIn("token=", email.body)

        mock_timer.assert_called_once_with(300, ANY, args=[self.user.pk])

    def test_verify_email_view_valid_token_activates_user(self):
        url = f"/verify-email?uid={self.uid}&token={self.token}"
        request = self.factory.get(url)
        response = verify_email_view(request)

        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
        self.assertEqual(response.status_code, 200)
        self.assertIn("✅ Email Verified!", response.content.decode())

    def test_verify_email_view_invalid_token_returns_400(self):
        url = f"/verify-email?uid={self.uid}&token=invalidtoken"
        request = self.factory.get(url)
        response = verify_email_view(request)

        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)
        self.assertEqual(response.status_code, 400)
        self.assertIn("❌ Invalid or Expired Link", response.content.decode())

    def test_verify_email_view_bad_uid_returns_400(self):
        url = f"/verify-email?uid=baduid&token={self.token}"
        request = self.factory.get(url)
        response = verify_email_view(request)

        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid link", response.content.decode())

    def test_delete_user_after_timeout_deletes_inactive_user(self):
        self.user.is_active = False
        self.user.save()

        delete_user_after_timeout(self.user.pk)

        with self.assertRaises(User.DoesNotExist):
            User.objects.get(pk=self.user.pk)

    def test_delete_user_after_timeout_does_not_delete_active_user(self):
        self.user.is_active = True
        self.user.save()

        delete_user_after_timeout(self.user.pk)

        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

