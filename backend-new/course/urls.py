from django.urls import path
from . import views

urlpatterns = [
    path('', views.CourseListCreateView.as_view(), name='course-list-create'),
    path('<int:id>/', views.CourseRetrieveUpdateDestroyView.as_view(), name='course-detail'),
]