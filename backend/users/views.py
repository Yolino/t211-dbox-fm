from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from django.conf import settings
from users.utils import token_generator

def create_html_answer(state=False):
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Email Verified</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background: #f4f4f9;
                color: #333;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
            }}
            .card {{
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                text-align: center;
            }}
            .success {{
                color: green;
                font-size: 24px;
                margin-bottom: 10px;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="success">{'✅ Email Verified!' if state else '❌ Invalid or Expired Link'}</div>
            <p>{'Your email has been successfully verified. You may now log in.' if state else ''}</p>
            <a href={settings.WEBSITE_URL}>{'Go to Login' if state else 'Retry signup'}</a>
        </div>
    </body>
    </html>
    """
    return html

def verify_email_view(request):
    print('hello')

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
        return HttpResponse(create_html_answer(True), status=200)
    else:
        return HttpResponse(create_html_answer(False), status=400)
