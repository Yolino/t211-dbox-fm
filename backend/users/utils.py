from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
import random

def gen_random_digit():
    return get_random_string(length=5, allowed_chars='0123456789')

def send_verification_email(user):

    send_mail(
        subject="Verification to your email address",
        message=f"Your code: {gen_random_digit()}",
        from_email="no-reply@dbox-fm.be",
        recipient_list=[user.email],
    )

