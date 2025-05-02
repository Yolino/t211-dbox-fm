from django.core.mail import send_mail
from django.conf import settings

def send_email_to_address(address, subject, message):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[address],
            fail_silently=False,
        )
    except Exception as e:
        print(f"An error occured while sending an email : {e}")

def send_user_ban_mail(user):
    subject = f"[DBOX] Account suspended"
    message = f"Dear {user.username},\nWe wish to inform you that your account has been reviewed by a moderator, who judged it was inappropriate. Your account has therefore been suspended from the platform.\nIf you wish to appeal this decision, please send an email to appeal@dbox-fm.be with the same email address this message has been sent to.\nRegards,\nThe DBOX team"
    send_email_to_address(user.email, subject, message)

def send_content_ban_mail(user, content_type: str, content_name: str, content_id: int):
    ban_id = content_type[0].upper() + str(content_id)
    subject = f"[DBOX] #{ban_id} - {content_type.capitalize()} banned"
    message = f"Dear {user.username},\nWe wish to inform you that your {content_type} : '{content_name}', has been reviewed by a moderator, who judged it was inappropriate. This {content_type} has therefore been removed from the platform\nIf you wish to appeal this decision, please send an email to appeal@dbox-fm.be containing the ID #{ban_id}.\nRegards,\nThe DBOX team"
    send_email_to_address(user.email, subject, message)
