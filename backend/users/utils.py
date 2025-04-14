from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, base36_to_int
from django.utils.encoding import force_bytes
from django.urls import reverse
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from datetime import timedelta, datetime
from django.conf import settings
import threading

def delete_user_after_timeout(user):
    try:
        if not user.is_active:
            user.delete()
    except user.DoesNotExist:
        print(f"Error while trying to delete user {user} : this User does not exist")

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

    timestamp = token_generator._num_seconds(datetime.now())

    token = token_generator._make_token_with_timestamp(user, timestamp, None)
    uid = urlsafe_base64_encode(force_bytes(user.pk)) 

    verify_url = request.build_absolute_uri(
        reverse('verify-email') + f'?uid={uid}&token={token}'
    )
    try:
        send_mail(
            subject="Verification to your email address",
            message=f"Your verification link: {verify_url}\nYou have 5 minutes to use it",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f'nope {e}')
 
    timer = threading.Timer(300, delete_user_after_timeout, args=[user])
    timer.start()
