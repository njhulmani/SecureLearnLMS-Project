from django.urls import path
from .views import (
    create_course, edit_course, all_courses, archive_course,
    add_video, edit_video, delete_video, video_details,
    enroll_student, list_enrollments, delete_enrollment,
    student_courses, list_courses, mark_video_complete,
    watch_course, course_details, course_videos,
    continue_watching, track_video_watch
)

urlpatterns = [
    path('api/create-course/', create_course),
    path('api/add-video/', add_video),
    path('api/enroll/', enroll_student),
    path('api/student-courses/', student_courses),
    path('api/courses/', list_courses),
    path('api/mark-complete/', mark_video_complete),
    path('api/enrollments/', list_enrollments),
    path('api/enrollment/<int:enrollment_id>/', delete_enrollment),
    path('api/edit-course/<int:course_id>/', edit_course),
    path('api/all-courses/', all_courses),
    path('api/archive-course/<int:course_id>/', archive_course),
    path('api/watch-course/<int:course_id>/<int:video_id>/', watch_course),
    path('api/course-details/<int:course_id>/', course_details),
    path('api/course-videos/<int:course_id>/', course_videos),
    path('api/continue-watching/', continue_watching),  
    path('api/track-video-watch/', track_video_watch),
    path('api/video-details/<int:video_id>/', video_details),
    path('api/edit-video/<int:video_id>/', edit_video),
    path('api/delete-video/<int:video_id>/', delete_video),
]