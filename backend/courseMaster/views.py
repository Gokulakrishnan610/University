from django.shortcuts import render
from rest_framework import generics
from .models import CourseMaster
from .serializers import CourseMasterSerializer
from rest_framework.permissions import IsAuthenticated
from authentication.authentication import JWTCookieAuthentication

# Create your views here.
class CourseMasterListAPIView(generics.ListAPIView):
    authentication_classes=[JWTCookieAuthentication]
    permission_classes=[IsAuthenticated]
    queryset = CourseMaster.objects.all()
    serializer_class = CourseMasterSerializer