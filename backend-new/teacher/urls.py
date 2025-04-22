from django.urls import path
from . import views

urlpatterns = [
    path('', views.TeacherListView.as_view(), name='teacher-list'),
    path('add/', views.AddNewTeacher.as_view(), name='add-teacher'),
    path('<int:id>/', views.TeacherDetailView.as_view(), name='teacher-detail'),
]