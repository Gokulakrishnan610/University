from django.shortcuts import render
from rest_framework.generics import ListAPIView
from authentication.authentication import JWTCookieAuthentication
from rest_framework.permissions import IsAuthenticated
from .serializers import SlotSerializer
from .models import Slot

# Create your views here.
class SlotListView(ListAPIView):
    authentication_classes = [JWTCookieAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = SlotSerializer

    def get_queryset(self):
        slots = Slot.objects.filter()

        return slots