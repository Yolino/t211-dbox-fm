import logging
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, base36_to_int
from django.utils.encoding import force_bytes
from django.urls import reverse
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from datetime import timedelta, datetime
from django.conf import settings
import threading
from django.contrib.auth import get_user_model

logger = logging.getLogger('django.user')

def delete_user_after_timeout(id):
    try:
        user=get_user_model().objects.get(pk=id)
        if not user.is_active:
            logger.info(f"User {user} with email {user.email} and id {user.id} has been permanently deleted due to missed confirmation email")
            user.delete()
    except user.DoesNotExist:
        logger.error(f"Error while trying to delete user {user} with {user.email} and id {user.id} : this User does not exist")

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
            subject="[DBOX] Verification to your email address",
            message=f"Your verification link: {verify_url}\nYou have 5 minutes to use it",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        logger.error(f"An error occured while sending an email to {user.email} : {e}")
 
    timer = threading.Timer(300, delete_user_after_timeout, args=[user.pk])
    timer.start()

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')
