from django.contrib import admin
from .models import ReportUser, ReportPublication, ReportComment

admin.site.register(ReportUser)
admin.site.register(ReportPublication)
admin.site.register(ReportComment)

