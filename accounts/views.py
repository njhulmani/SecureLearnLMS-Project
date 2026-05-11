
from django.contrib.auth.hashers import make_password

from urllib import request

from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from rest_framework.authtoken.models import Token
from accounts.permissions import IsSessionValid
import uuid

from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from accounts.models import User, UserSession, PasswordResetToken

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from courses.models import Course, Video, Enrollment, VideoProgress

from .models import UserSession
User = get_user_model()


# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSessionValid])
def create_user(request):

    # 👮 admin only
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)

    # 📥 get data
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role')

    # ❗ validation
    if not username or not password or not role:
        return Response({'error': 'username, password and role are required'}, status=400)

    # ❗ check duplicate user
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)

    try:
        # ✅ create user (password hashed automatically)
        user = User.objects.create_user(
            username=username,
            password=password,
            role=role
        )

        user.first_name = first_name or ''
        user.last_name = last_name or ''
        user.save()

        return Response({'message': 'User created successfully'})

    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ======================== Login API =========================
@api_view(['POST'])
def login_api(request):

    identifier = request.data.get('identifier')
    password = request.data.get('password') 

    if not identifier or not password:
        return Response({'error': 'Missing credentials'}, status=400)
    
    identifier = identifier.strip()

    user_obj = User.objects.filter(
        Q(username__iexact=identifier) | Q(email__iexact=identifier) | Q(phone__iexact=identifier)
    ).first()

    if user_obj is None:
        return Response({'error': 'User not found'}, status=404)

    user = authenticate(request, username=user_obj.username, password=password)

    if user is None:
        return Response({'error': 'Invalid credentials'}, status=401)

    if not user.is_active:
        return Response({'error': 'User disabled'}, status=403)

    # 🔥 Remove old sessions
    UserSession.objects.filter(user=user).delete()

    # ================= IP ADDRESS =================
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')

    if x_forwarded_for:
        ip_address = x_forwarded_for.split(',')[0]
    else:
        ip_address = request.META.get('REMOTE_ADDR')

    # ================= DEVICE INFO =================
    device_info = request.META.get(
        'HTTP_USER_AGENT',
        'Unknown Device'
    )


    session = UserSession.objects.create(
        user=user,
        session_token=uuid.uuid4(),
        is_active=True,
        ip_address=ip_address,
        device_info=device_info,
        expires_at=timezone.now() + timedelta(minutes=30)
    )

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'access_token': token.key,
        'session_token': str(session.session_token),
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSessionValid])
def list_students(request):
    
    students = User.objects.filter(role='student').values(
        'id', 'first_name', 'last_name', 'username'
    )
    return Response(list(students))


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSessionValid])
def force_logout(request):

    # 👮 Role check
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)

    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id required'}, status=400)

    try:
        target = User.objects.get(id=int(user_id))
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    # ❗ Deactivate ALL active sessions of that user
    updated = UserSession.objects.filter(user=target, is_active=True).update(is_active=False)

    return Response({'message': 'User logged out', 'affected_sessions': updated})


# ✅ NEW: Disable user (Admin only)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSessionValid])
def disable_user(request, user_id):

    # Admin only
    if request.user.role != 'admin':
        return Response({'error':'Unauthorized'}, status=403)

    try: 
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error':'User not found'}, status=404)

    # prevent admin disabling self
    if user == request.user:
        return Response({'error': 'Admin cannot disable self'}, status=400)


    # optional:
    # prevent disabling other admins
    if user.role == 'admin':
        return Response({'error': 'Another admin cannot be disabled'}, status=400)


    # already disabled check
    if not user.is_active:
        return Response({'message': 'User already disabled'})

    # Disable user
    user.is_active=False
    user.save()

    return Response({

        'message':
        'User disabled successfully',

        'user_id':
        user.id,

        'status':
        'disabled'

    })

# ✅ NEW: Enable user (Admin only)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSessionValid])
def enable_user(request, user_id):

    # admin only
    if request.user.role != 'admin':
        return Response(
            {'error':'Unauthorized'},
            status=403
        )

    try:
        user = User.objects.get(id=user_id)

    except User.DoesNotExist:
        return Response(
            {'error':'User not found'},
            status=404
        )


    # optional: prevent enabling admins manually
    if user.role == 'admin':
        return Response(
          {'error':'Cannot modify admin'},
          status=400
        )

    # already enabled
    if user.is_active:
        return Response(
            {
             'message':
             'User already active'
            }
        )

    user.is_active = True
    user.save()

    return Response({
       'message': 'User enabled successfully',
       'user_id': user.id,
       'status': 'enabled'
    })


# ✅ NEW: Edit user details (Admin only)
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSessionValid])
def edit_user(request):

    if request.user.role != 'admin':
        return Response({'error':'Unauthorized'}, status=403)

    user_id = request.data.get('user_id')

    try:
        user = User.objects.get(id=int(user_id))

    except User.DoesNotExist:
        return Response({'error':'User not found'}, status=404)


    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    role = request.data.get('role')

    if first_name:
        user.first_name = first_name

    if last_name:
        user.last_name = last_name

    if role:
        user.role = role

    user.save()

    return Response({'message':'User updated successfully'})


# ✅ NEW: List active sessions (Admin only)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSessionValid])
def active_sessions(request):

 if request.user.role!='admin':
   return Response({'error':'Unauthorized'}, status=403)

 sessions=UserSession.objects.filter(is_active=True).values(
    'user__username',
    'ip_address',
    'device_info',
    'created_at'
 )

 return Response(list(sessions))


# Admin Stats
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSessionValid])
def admin_stats(request):

    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)

    data = {
        "users": User.objects.count(),
        "courses": Course.objects.filter(is_archived=False).count(),
        "videos": Video.objects.filter(course__is_archived=False).count(),
        "enrollments": Enrollment.objects.filter(course__is_archived=False).count(),
        "disabled_users": User.objects.filter(is_active=False).count()
    }

    return Response(data)



# ========================= Self logout =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSessionValid])
def logout_api(request):

    session_token = request.headers.get('Session-Token')

    if not session_token:
        return Response({'error': 'Session token missing'}, status=400)

    # Deactivate the session associated with this user and token
    updated = UserSession.objects.filter(
        user=request.user,
        session_token=session_token,
        is_active=True
    ).update(is_active=False)

    return Response({
        'message': 'Logged out',
        'affected_sessions': updated
    })


# ========================= Trainer stats =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSessionValid])
def trainer_stats(request):

    if request.user.role != 'trainer':
        return Response({'error':'Unauthorized'}, status=403)

    courses = Course.objects.filter(trainer=request.user, is_archived=False ).count()
    videos = Video.objects.filter(course__trainer=request.user, course__is_archived=False ).count()

    data = {
       'courses':courses,
       'videos':videos,
    }

    return Response(data)



# ✅ NEW: Student stats (Student only)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSessionValid])
def student_stats(request):

    if request.user.role!='student':
        return Response({'error':'Unauthorized'}, status=403)

    enrollments=Enrollment.objects.filter(student=request.user, course__is_archived=False)

    course_count = enrollments.count()
    total_videos = 0
    completed = 0

    for enroll in enrollments:
        videos=Video.objects.filter(course=enroll.course, course__is_archived=False)
        total_videos+=videos.count()
        for v in videos:
            if VideoProgress.objects.filter(
               student=request.user,
               video=v,
               completed=True
            ).exists():
                completed+=1

    progress = 0

    if total_videos > 0:
       progress = round(completed/total_videos*100)

    return Response({
      'courses':course_count,
      'completed':completed,
      'total_videos':total_videos,
      'progress':progress

    })


# list all users with active session info (Admin only)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSessionValid])
def list_users(request):

    if request.user.role!='admin':
        return Response(
          {'error':'Unauthorized'},
          status=403
        )

    users=User.objects.all()

    data=[]

    for u in users:
        active_session=UserSession.objects.filter(user=u, is_active=True).exists()

        data.append({
          'id':u.id,
          'username':u.username,
          'first_name':u.first_name,
          'last_name':u.last_name,
          'role':u.role,
          'is_active':u.is_active,
          'has_active_session':
             active_session
        })

    return Response(data)



# Forgot password
@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')

    user = User.objects.filter(email=email).first()
    if not user:
        return Response({'error': 'User not found'}, status=404)

    # create token
    reset = PasswordResetToken.objects.create(
        user=user,
        expires_at=timezone.now() + timedelta(minutes=10)   
    )

    reset_link = f"http://localhost:3000/reset-password/{reset.token}"

    send_mail(
        subject="Reset your password",
        message=f"Click this link to reset your password:\n{reset_link}",
        from_email="noreply@lms.com",
        recipient_list=[email],
    )

    return Response({'message': 'Reset link sent'})


# Reset password
@api_view(['POST'])
def reset_password(request, token):
    password = request.data.get('password')

    if len(password) < 6:
        return Response({'error': 'Password must be at least 6 characters'}, status=400)

    reset_obj = PasswordResetToken.objects.filter(token=token).first()

    if not reset_obj:
        return Response({'error': 'Invalid or expired token'}, status=400)

    user = reset_obj.user
    user.set_password(password) 
    user.save()

    # delete token after use
    if timezone.now() > reset_obj.expires_at:
        reset_obj.delete()
        return Response({'error': 'Token expired'}, status=400) 

    return Response({'message': 'Password updated successfully'})


# Get current user info
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsSessionValid])
def current_user(request):

    user = request.user

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "date_joined": user.date_joined,
    })
