from django.contrib import admin
from .models import User, UserSession

class UserAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'username',
        'first_name',
        'last_name',
        'email',
        'role',
        'date_joined'
    )

admin.site.register(User, UserAdmin)


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):

    list_display = (
        'user',
        'ip_address',
        'device_info',
        'is_active',
        'created_at'
    )