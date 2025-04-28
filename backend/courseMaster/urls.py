from django.urls import path
from .views import CourseMasterListAPIView, CourseMasterDetailAPIView

urlpatterns = [
    path('', CourseMasterListAPIView.as_view(), name='course-master'),
    path('<int:pk>/', CourseMasterDetailAPIView.as_view()),
]