from django.urls import path
from .views import StudentListCreateView, StudentRetrieveUpdateDestroyView, StudentStatsView

urlpatterns = [
    path('', StudentListCreateView.as_view(), name='student-list-create'),
    path('<int:id>/', StudentRetrieveUpdateDestroyView.as_view(), name='student-detail'),
    path('stats/', StudentStatsView.as_view()),
]