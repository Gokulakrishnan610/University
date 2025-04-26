from django.urls import path
from .views import CourseListView, CourseDetailView, CourseResourceAllocationListCreateView, CourseResourceAllocationDetailView

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('<int:id>/', CourseDetailView.as_view(), name='course-detail'),
    path('resource-allocation/', CourseResourceAllocationListCreateView.as_view(), name='resource-allocation-list'),
    path('resource-allocation/<int:id>/', CourseResourceAllocationDetailView.as_view(), name='resource-allocation-detail'),
]