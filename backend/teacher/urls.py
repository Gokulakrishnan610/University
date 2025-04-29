from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for viewsets
router = DefaultRouter()
router.register(r'availability', views.TeacherAvailabilityViewSet, basename='teacher-availability')

urlpatterns = [
    path('', views.TeacherListView.as_view(), name='teacher-list'),
    path('add/', views.AddNewTeacher.as_view(), name='add-teacher'),
    path('<int:id>/', views.TeacherDetailView.as_view(), name='teacher-detail'),
    
    path('pop/', views.TeacherListView.as_view(queryset=views.Teacher.objects.filter(teacher_role='POP')), name='pop-teacher-list'),
    path('industry-professionals/', views.TeacherListView.as_view(queryset=views.Teacher.objects.filter(is_industry_professional=True)), name='industry-professional-list'),
    
    path('', include(router.urls)),
]