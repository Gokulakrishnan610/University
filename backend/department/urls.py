from django.urls import path
from .views import DepartmentListCreateView, DepartmentDetailView

urlpatterns = [
    # Endpoint to list all departments or create a new one
    path('', DepartmentListCreateView.as_view(), name='department-list-create'),
    # Endpoint to retrieve, update or delete a department
    path('<int:pk>/', DepartmentDetailView.as_view(), name='department-detail'),
]