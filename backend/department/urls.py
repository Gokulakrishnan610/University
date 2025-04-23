from django.urls import path
from .views import DepartmentListCreateView

urlpatterns = [
    # Endpoint to list all departments or create a new one
    path('', DepartmentListCreateView.as_view(), name='department-list-create'),
]