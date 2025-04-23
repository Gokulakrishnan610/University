from django.urls import path
from . import views

urlpatterns = [
    path('', views.TeacherCourseListCreateView.as_view(), name='teacher-course-list-create'),
    path('<int:id>/', views.TeacherCourseRetrieveUpdateDestroyView.as_view(), name='teacher-course-detail'),
]