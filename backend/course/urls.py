from django.urls import path
from .views import AddNewCourse, CourseListView, CourseDetailView

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('create/', AddNewCourse.as_view(), name='course-create'),
    path('<int:id>/', CourseDetailView.as_view(), name='course-detail'),
]