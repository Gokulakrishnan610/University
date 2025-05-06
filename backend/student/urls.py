from django.urls import path
from .views import StudentListCreateView, StudentRetrieveUpdateDestroyView, StudentStatsView, DepartmentStudentCountView

urlpatterns = [
    path('', StudentListCreateView.as_view(), name='student-list-create'),
    path('<int:id>/', StudentRetrieveUpdateDestroyView.as_view(), name='student-detail'),
    path('stats/', StudentStatsView.as_view()),
    path('department/<int:dept_id>/student-count/', DepartmentStudentCountView.as_view(), name='department-student-count'),
]