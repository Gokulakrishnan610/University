from django.urls import path
from . import views

urlpatterns = [
    path('', views.SlotListView.as_view(), name="slots-list"),
    path('teacher-slot-preference/', views.TeacherSlotPreferenceView.as_view(), name="teacher-slot-preference"),
    path('teacher-slot-preference/<str:pk>/', views.TeacherSlotListView.as_view(), name="teacher-slot-preference-detail"),
]
