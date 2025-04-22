from django.urls import path
from . import views

urlpatterns = [
    path('', views.StudentCourseListCreateView.as_view(), name='student-course-list-create'),
    path('<int:id>/', views.StudentCourseRetrieveUpdateDestroyView.as_view(), name='student-course-detail'),
]