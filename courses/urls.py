from django.urls import path
from .views import all_courses, archive_course, continue_watching, course_videos, course_details, create_course, add_video, delete_enrollment, edit_course, enroll_student, list_enrollments, mark_video_complete, student_courses, list_courses, track_video_watch, watch_course

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
]