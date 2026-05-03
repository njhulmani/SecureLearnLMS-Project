from django.urls import path
from .views import active_sessions, admin_stats, create_user, disable_user, edit_user, enable_user, forgot_password, list_users, login_api, list_students, force_logout, reset_password, student_stats, trainer_stats, logout_api

urlpatterns = [ 
    path('api/create-user/', create_user),
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
]