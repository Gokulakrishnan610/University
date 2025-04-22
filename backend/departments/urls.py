from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, TeacherViewSet

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'teachers', TeacherViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 