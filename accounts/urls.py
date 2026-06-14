from django.urls import path
from .views import active_sessions, admin_stats, approve_registration_request, create_user, current_user, disable_user, edit_user, enable_user, forgot_password, list_registration_requests, list_users, login_api, list_students, force_logout, reject_registration_request, reset_password, signup_request, student_stats, trainer_stats, logout_api

urlpatterns = [ 
    path('api/create-user/', create_user),
    path('api/signup-request/', signup_request),
    path('api/registration-requests/', list_registration_requests),
    path('api/registration-requests/<int:request_id>/approve/', approve_registration_request),
    path('api/registration-requests/<int:request_id>/reject/', reject_registration_request),
    path('api/login/', login_api),
    path('api/students/', list_students),
    path('api/force-logout/', force_logout),
    path('api/logout/', logout_api),
    path('api/disable-user/<int:user_id>/', disable_user),
    path('api/enable-user/<int:user_id>/', enable_user),
    path('api/edit-user/', edit_user),
    path('api/active-sessions/', active_sessions),
    path('api/admin-stats/', admin_stats),
    path('api/trainer-stats/', trainer_stats),
    path('api/student-stats/', student_stats),
    path('api/users/', list_users),
    path('api/forgot-password/', forgot_password),
    path('api/reset-password/<uuid:token>/', reset_password),
    path('api/current-user/', current_user),
]