from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TimetableViewSet, TimetableChangeViewSet

router = DefaultRouter()
router.register(r'timetables', TimetableViewSet)
router.register(r'timetable-changes', TimetableChangeViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 