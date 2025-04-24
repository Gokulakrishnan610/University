from django.shortcuts import render
from rest_framework import generics
from .models import CourseMaster
from .serializers import CourseMasterSerializer
from authentication.authentication import IsAuthenticated

# Create your views here.
class CourseMasterListAPIView(generics.ListAPIView):
    permission_classes=[IsAuthenticated]
    queryset = CourseMaster.objects.all()
    serializer_class = CourseMasterSerializer