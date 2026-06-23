from django.contrib import admin
from .models import Course, Video, Enrollment


# ================= COURSE ADMIN =================
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'title',
    )

    search_fields = (
        'title',
    )


# ================= VIDEO ADMIN =================
@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'title',
        'course',
    )

    search_fields = (
        'title',
        'course__title',
    )


# ================= ENROLLMENT ADMIN =================
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'student',
        'course',
    )

    search_fields = (
        'student__username',
        'course__title',
    )