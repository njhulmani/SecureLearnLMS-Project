from rest_framework.permissions import BasePermission
from accounts.models import UserSession
from django.utils import timezone
from datetime import timedelta

class IsSessionValid(BasePermission):
    def has_permission(self, request, view):
        session_token = request.headers.get("Session-Token")

        if not session_token:
            return False
        
        try:
            session = UserSession.objects.get(
                user=request.user,
                session_token=session_token,
                is_active=True
            )
        except UserSession.DoesNotExist:
            return False

        # 🔥 AUTO LOGOUT LOGIC (30 mins)
        if session.expires_at and timezone.now() > session.expires_at:
            session.is_active = False
            session.save()
            return False

        # ✅ OPTIONAL (sliding session)
        session.expires_at = timezone.now() + timedelta(minutes=30)
        session.last_activity = timezone.now()
        session.save()

        return True