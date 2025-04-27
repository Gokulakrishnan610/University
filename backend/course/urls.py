from django.urls import path
from .views import (
    CourseListView, 
    CourseDetailView, 
    CourseResourceAllocationListCreateView, 
    CourseResourceAllocationDetailView,
    CourseRoomPreferenceListCreateView,
    CourseRoomPreferenceDetailView
)

urlpatterns = [
    path('', CourseListView.as_view(), name='course-list'),
    path('<int:id>/', CourseDetailView.as_view(), name='course-detail'),
    path('resource-allocation/', CourseResourceAllocationListCreateView.as_view(), name='resource-allocation-list'),
    path('resource-allocation/<int:id>/', CourseResourceAllocationDetailView.as_view(), name='resource-allocation-detail'),
    path('<int:course_id>/room-preferences/', CourseRoomPreferenceListCreateView.as_view(), name='course-room-preference-list'),
    path('<int:course_id>/room-preferences/<int:id>/', CourseRoomPreferenceDetailView.as_view(), name='course-room-preference-detail'),
]