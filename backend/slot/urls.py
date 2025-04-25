from django.urls import path
from . import views

urlpatterns = [
    path('', views.SlotListView.as_view(), name="slots-list"),
]
