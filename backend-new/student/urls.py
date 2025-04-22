from django.urls import path
from . import views

urlpatterns = [
    path('', views.StudentListCreateView.as_view(), name='student-list-create'),
    path('<int:id>/', views.StudentRetrieveUpdateDestroyView.as_view(), name='student-detail'),
]