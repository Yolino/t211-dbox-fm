from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from users.utils import token_generator

def verify_email_view(request):

    uid = request.GET.get('uid')
    token = request.GET.get('token')

    try:
        uid = urlsafe_base64_decode(uid).decode()
        user = get_user_model().objects.get(pk=uid)
    except Exception:
        return HttpResponse('Invalid link', status=400)

    if token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return HttpResponse('Good job', status=200)
    else:
        return HttpResponse('Verification failed', status=400)
