from django.urls import path
from .views import CourseMasterListAPIView

urlpatterns = [
    path('', CourseMasterListAPIView.as_view(), name='course-master'),
]