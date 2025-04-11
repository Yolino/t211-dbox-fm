from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, base36_to_int
from django.utils.encoding import force_bytes
from django.urls import reverse
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from datetime import timedelta, datetime

class TimedTokenGenerator(PasswordResetTokenGenerator):
    def __init__(self, timeout_minutes=10):
        super().__init__()
        self.timeout = timeout_minutes * 60

    def check_token(self, user, token):
        if not super().check_token(user, token):
            return False

        try:
            ts_b36 = token.split("-")[0]
            ts = base36_to_int(ts_b36)
        except (IndexError, ValueError):
            return False

        return self._num_seconds(datetime.now()) - ts <= self.timeout

token_generator = TimedTokenGenerator(timeout_minutes=5)

def send_verification_email(user, request):

    # token_generator = TimedTokenGenerator(timeout_minutes=1)
    timestamp = token_generator._num_seconds(datetime.now())

    token = token_generator._make_token_with_timestamp(user, timestamp, None)
    uid = urlsafe_base64_encode(force_bytes(user.pk)) 

    verify_url = request.build_absolute_uri(
        reverse('verify-email') + f'?uid={uid}&token={token}'
    )

    send_mail(
        subject="Verification to your email address",
        message=f"Your verification link: {verify_url}\nYou have 5 minutes to use it",
        from_email="no-reply@dbox-fm.be",
        recipient_list=[user.email],
    )

