
from urllib import request

from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ContinueWatching, Course, VideoProgress, Video, Enrollment, User
from django.contrib.auth import get_user_model
from accounts.utils import validate_session
from django.utils import timezone
User = get_user_model()


# Create Course 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    if request.user.role != "admin":
        return Response({'error': 'Unauthorized access, only admin can create courses'}, status=403)

    title = request.data.get('title')
    description = request.data.get('description')
    category = request.data.get('category')
    level = request.data.get('level')
    duration = request.data.get('duration')


    if not title:
        return Response({'error': 'Title required'}, status=400)

    course = Course.objects.create(
        title=title,
        description=description,
        category=category,
        level=level,
        duration=duration,
        trainer=request.user
    )

    return Response({'message': 'Course created successfully'})


# Endpoint for editing course details (Admin can edit all, Trainer can edit own courses)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_course(request, course_id):

    session_check= validate_session(request)
    if session_check:
        return session_check

    if request.user.role not in ['admin', 'trainer']:
        return Response({'error':'Unauthorized'}, status=403)

    try:
        course=Course.objects.get(id=course_id, is_archived=False)
    except Course.DoesNotExist:
        return Response({'error':'Course not found'}, status=404)


    # Trainer can edit only own course
    if (request.user.role=='trainer' and course.trainer != request.user):
        return Response({'error': 'Unauthorized'}, status=403)


    course.title= request.data.get('title', course.title)
    course.description= request.data.get('description', course.description)
    course.category= request.data.get('category', course.category)
    course.level= request.data.get('level', course.level)
    course.duration= request.data.get( 'duration', course.duration)
    course.save()


    return Response({
      'message':
      'Course updated successfully'
    })


# Admin and Trainer can see all courses, Student can see all courses (for enrollment)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_courses(request):

    session_check=validate_session(request)
    if session_check:
        return session_check

    if request.user.role!='admin':
        return Response({'error':'Unauthorized'}, status=403)

    courses=Course.objects.filter(is_archived=False)

    data=[]

    for c in courses:

        data.append({
         'id': c.id,
         'title': c.title,
         'description': c.description,
         'category': c.category,
         'level': c.level,
         'duration': c.duration,
         'videos_count': c.video_set.count(),
         'created_by': (
            f"{c.trainer.role.capitalize()} ({c.trainer.username})"
            if c.trainer else ''
        )
        })

    return Response(data)


# Admin can archive any course, Trainer can archive own courses. Archived courses won't be visible to students for enrollment, but existing enrollments remain unaffected.
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def archive_course(request, course_id):

    session_check = validate_session(request)

    if session_check:
        return session_check


    if request.user.role not in ['admin', 'trainer']:
        return Response({'error':'Unauthorized'}, status=403)

    try:
        course = Course.objects.get(id=course_id, is_archived=False)

    except Course.DoesNotExist:
        return Response({'error':'Not found'}, status=404)


    if(request.user.role=='trainer' and course.trainer!=request.user):
        return Response({'error':'Unauthorized'}, status=403)

    course.is_archived=True
    course.save()


    return Response({
      'message':
      'Course archived'
    })


# Admin+Trainer can add videos
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_video(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    # ✅ Role check (Admin + Trainer only)
    if request.user.role not in ['admin', 'trainer']:
        return Response({'error': 'Unauthorized'}, status=403)

    # ✅ Get data
    course_id = request.data.get('course_id')
    title = request.data.get('title')
    description = request.data.get('description')  # ✅ NEW
    youtube_link = request.data.get('youtube_link')

    # ✅ Validate required fields
    if not course_id or not title or not youtube_link:
        return Response({'error': 'All fields required'}, status=400)

    # ✅ Validate course_id
    try:
        course_id = int(course_id)
    except ValueError:
        return Response({'error': 'Invalid course id'}, status=400)

    # ✅ Fetch course
    try:
        course = Course.objects.get(id=course_id, is_archived=False)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    # ✅ Create video
    video = Video.objects.create(
        course=course,
        title=title,
        description=description,  # ✅ SAVE DESCRIPTION
        youtube_link=youtube_link
    )

    return Response({
        'message': 'Video added successfully',
        'video': {
            'title': video.title,
            'description': video.description,
            'course': course.title
        }
    })


# Admin can enroll any student to any course, Trainer can enroll students to their courses, but cannot enroll themselves. Students cannot enroll others.
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_student(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    # ✅ Only admin can enroll
    if request.user.role != 'admin':
        return Response({'error': 'Unauthorized'}, status=403)

    # ✅ Validate input
    student_id = request.data.get('student_id')
    course_id = request.data.get('course_id')

    if not student_id or not course_id:
        return Response({'error': 'All fields required'}, status=400)

    try:
        student_id = int(student_id)
        course_id = int(course_id)
    except ValueError:
        return Response({'error': 'Invalid IDs'}, status=400)

    # ✅ Fetch student (ONLY student role allowed)
    try:
        student = User.objects.get(id=student_id, role='student')
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=404)

    # ✅ Fetch course
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    # ✅ Prevent duplicate enrollment
    if Enrollment.objects.filter(student=student, course=course).exists():
        return Response({'error': 'Already enrolled'}, status=400)

    # ✅ Create enrollment
    Enrollment.objects.create(student=student, course=course)

    return Response({
        'message': 'Student enrolled successfully',
        'student': student.username,
        'course': course.title
    })


# Student can see their enrolled courses with progress, Admin can see all courses,  Archived courses won't be visible to students for enrollment, but existing enrollments remain unaffected.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_courses(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    if request.user.role != 'student':
        return Response({'error':'Unauthorized'}, status=403)

    enrollments = Enrollment.objects.filter(student=request.user, course__is_archived=False)

    data=[]

    for enroll in enrollments:
        course = enroll.course
        videos = Video.objects.filter(
            course=course
        )

        total_videos = videos.count()

        completed_videos = VideoProgress.objects.filter(
            student=request.user,
            video__course=course,
            completed=True
        ).count()

        progress = 0

        if total_videos > 0:
            progress = round(
               (completed_videos / total_videos) * 100
            )

        data.append({
            'id': course.id,
            'course': course.title,
            'description': course.description,
            'category': course.category,
            'level': course.level,
            'duration': course.duration,
            'progress': progress,

            'videos': [
                {
                    'id': v.id,
                    'title': v.title,
                    'description': v.description,
                    'link': v.youtube_link,
                    'completed':
                        VideoProgress.objects.filter(
                            student=request.user,
                            video=v,
                            completed=True
                        ).exists()
                }
                for v in videos
            ]
        })

    return Response(data)


# List all courses
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_courses(request):

    session_check = validate_session(request)
    if session_check:
        return session_check
    
    courses = Course.objects.filter(is_archived=False).values('id', 'title')
    return Response(list(courses))



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_video_complete(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    video_id=request.data.get('video_id')

    try:
        video=Video.objects.get(id=video_id)
    except Video.DoesNotExist:
        return Response({'error':'Video not found'}, status=404)

    progress,created = VideoProgress.objects.get_or_create(student=request.user, video=video)

    progress.completed=True
    progress.completed_at=timezone.now()
    progress.save()

    return Response({'message':'Completed'})


# Admin + Trainer can see all enrollments
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_enrollments(request):

    if request.user.role not in ['admin', 'trainer']:
        return Response({'error':'Unauthorized'}, status=403)

    enrollments=Enrollment.objects.filter(course__is_archived=False)
    data=[]

    for e in enrollments:
        data.append({'id':e.id, 'student_name':e.student.username, 'course_title':e.course.title})

    return Response(data)


# Admin can delete enrollment (unenroll student)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_enrollment(request, enrollment_id):

    if request.user.role!='admin':
        return Response({'error':'Unauthorized'}, status=403)

    try:
        enrollment=Enrollment.objects.get(id=enrollment_id)
    except Enrollment.DoesNotExist:
        return Response({'error':'Enrollment not found'}, status=404)
    
    enrollment.delete()

    return Response({
      'message':
      'Enrollment removed'
    })


# Student can watch course
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def watch_course(request, course_id, video_id):

    session_check = validate_session(request)
    if session_check:
        return session_check

    if request.user.role != 'student':
        return Response({'error': 'Unauthorized'}, status=403)

    try:
        course = Course.objects.get(id=course_id, is_archived=False)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()

    if not enrolled:
        return Response({'error': 'Not enrolled'}, status=403)

    try:
        current_video = Video.objects.get(id=video_id, course=course)
    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=404)

    videos = Video.objects.filter(course=course)
    
    ContinueWatching.objects.update_or_create(
        student=request.user,
        course=course,
        defaults={'last_video': current_video}
    )


    return Response({
        "course": {
            "id": course.id,
            "title": course.title,
        },

        "current_video": {
            "id": current_video.id,
            "title": current_video.title,
            "description": current_video.description,
            "youtube_link": current_video.youtube_link
        },

        "videos": [{"id": v.id, "title": v.title}
            for v in videos
        ]

    })


# Course Details
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_details(request, course_id):

    session_check = validate_session(request)
    if session_check:
        return session_check

    try:
        course = Course.objects.get(id=course_id, is_archived=False)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    return Response({
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "category": getattr(course, 'category', ''),
        "level": getattr(course, 'level', ''),
        "duration": getattr(course, 'duration', ''),
    })


# List videos of a course with completion status for the student
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_videos(request, course_id):

    session_check = validate_session(request)
    if session_check:
        return session_check

    videos = Video.objects.filter(course_id=course_id)

    data = []

    for v in videos:

        completed = VideoProgress.objects.filter(
            student=request.user,
            video=v,
            completed=True
        ).exists()

        data.append({
            "id": v.id,
            "title": v.title,
            "description": v.description,
            "link": v.youtube_link,
            "completed": completed
        })

    return Response(data)

# Continue watchning
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def continue_watching(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    data = []

    records = ContinueWatching.objects.filter(student=request.user).select_related('course', 'last_video')

    for item in records:
        data.append({
            "course_id": item.course.id,
            "course_title": item.course.title,
            "video_id": item.last_video.id,
            "video_title": item.last_video.title,
            "updated_at": item.updated_at
        })

    return Response(data)


# Track video
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_video_watch(request):

    session_check = validate_session(request)
    if session_check:
        return session_check

    course_id = request.data.get('course_id')
    video_id = request.data.get('video_id')

    try:
        course = Course.objects.get(id=course_id)
        video = Video.objects.get(id=video_id, course=course)
    except:
        return Response({'error': 'Invalid course/video'}, status=400)

    ContinueWatching.objects.update_or_create(
        student=request.user,
        course=course,
        defaults={'last_video': video}
    )

    return Response({'message': 'Tracking updated'})


# Get video details
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def video_details(request, video_id):

    session_check = validate_session(request)
    if session_check:
        return session_check

    try:
        video = Video.objects.get(id=video_id)
    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=404)

    # Verify user has access to this video (admin, trainer, or enrolled student)
    if request.user.role == 'admin':
        # Admin can view any video
        pass
    elif request.user.role == 'trainer':
        # Trainer can view only their course videos
        if video.course.trainer != request.user:
            return Response({'error': 'Unauthorized'}, status=403)
    else:
        # Student can view only enrolled course videos
        enrollment = Enrollment.objects.filter(
            student=request.user,
            course=video.course
        ).exists()
        if not enrollment:
            return Response({'error': 'Unauthorized'}, status=403)

    return Response({
        'id': video.id,
        'title': video.title,
        'description': video.description,
        'link': video.youtube_link,
        'course_id': video.course.id,
        'course_title': video.course.title
    })


# Edit video
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_video(request, video_id):

    session_check = validate_session(request)
    if session_check:
        return session_check

    # Only admin/trainer
    if request.user.role not in ['admin', 'trainer']:
        return Response({'error': 'Unauthorized'}, status=403)

    try:
        video = Video.objects.get(id=video_id)

    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=404)

    video.title = request.data.get('title', video.title)

    video.description = request.data.get('description', video.description)

    video.youtube_link = request.data.get('youtube_link', video.youtube_link)

    course_id = request.data.get('course_id')

    if course_id:
        try:
            course = Course.objects.get(id=course_id)
            video.course = course
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)

    video.save()

    return Response({'message': 'Video updated successfully'})


# Delete video
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_video(request, video_id):

    session_check = validate_session(request)
    if session_check:
        return session_check

    # Only admin/trainer
    if request.user.role not in ['admin', 'trainer']:
        return Response({'error': 'Unauthorized'}, status=403)

    try:
        video = Video.objects.get(id=video_id)

    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=404)

    video.delete()

    return Response({'message': 'Video deleted successfully'})