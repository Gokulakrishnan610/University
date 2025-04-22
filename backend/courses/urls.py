from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, TeacherCourseViewSet, StudentCourseViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'teacher-courses', TeacherCourseViewSet)
router.register(r'student-courses', StudentCourseViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 