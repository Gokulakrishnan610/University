from django.shortcuts import render, get_object_or_404
from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework import generics, permissions, status
from .models import *
from .serializers import *
from .authentication import IsAuthenticated

# Create your views here.
class LoginAPIView(generics.CreateAPIView):
    serializer_class = LoginSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'detail': 'Both email and password are required',
                'code': 'missing_credentials'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        user = authenticate(request, email=email, password=password)

        
        if user:
            is_blocked = BlockedStudents.objects.filter(email=email).exists()
            if is_blocked:
                return Response({
                    'detail': 'No account found with this email. If you think it\'s a mistake, please contact the admin.',
                    'code': 'user_not_found'
                }, status=status.HTTP_401_UNAUTHORIZED)
            if not user.is_active:
                return Response({
                    'detail': 'Your account is not active.',
                    'code': 'account_inactive'
                }, status=status.HTTP_401_UNAUTHORIZED)
            return user.generate_login_response()
            
        else:
            try:
                print("Hello Wiore", email)
                user = User.objects.get(email=email)
                is_blocked = BlockedStudents.objects.filter(email=email).exists()
                if is_blocked:
                    return Response({
                        'detail': 'No account found with this email. If you think it\'s a mistake, please contact the admin.',
                        'code': 'user_not_found'
                    }, status=status.HTTP_401_UNAUTHORIZED)
                return Response({
                    'detail': 'Invalid password. Please try again.',
                    'code': 'invalid_password'
                }, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                return Response({
                    'detail': 'No account found with this email. If you think it\'s a mistake, please contact the admin.',
                    'code': 'user_not_found'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
class ProfileAPIView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = [IsAuthenticated]

    def get(self, request):
        user = get_object_or_404(User, id=request.user.id)

        user_data = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "gender": user.gender,
            "year": user.year,
            "dept": user.dept,
            "roll_no": user.roll_no,
            "phone_number": user.phone_number,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "date_joined": user.date_joined,
            "last_login": user.last_login,
        }

        return Response({
            "message": "Success",
            "data": {
                "user": user_data,
            }
        }, status=status.HTTP_200_OK)

class VerifyTokenAPIView(APIView):
    def get(self, request):
        email = request.query_params.get('email', '')
        token = request.query_params.get('token', '')
        user = get_object_or_404(User, email=email)
        
        try:
            verify = BookingOTP.objects.get(user=user, code=token)
            verify.is_verified = True
            verify.save()

            return user.generate_login_response()
        except:
            return Response({'detail': 'Invalid Code.'}, status=status.HTTP_400_BAD_REQUEST)

class  ForgotPasswordAPI(generics.GenericAPIView):
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LoginSerializer

    def post(self, request):
        email = request.data.get('email', '')
        password = request.data.get('password', '')
        
        if not email or not password:
            return Response({
                'detail': 'Both email and new password are required',
                'code': 'missing_credentials'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                return Response({
                    'detail': 'Your account is not active. Please verify your email first.',
                    'code': 'account_inactive'
                }, status=status.HTTP_400_BAD_REQUEST)
            user.new_password=password
            user.send_forgot_password_mail(user.new_password)
            return Response({
                'detail': 'Verification code sent to your email',
                'code': 'reset_email_sent'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'detail': 'No account found with this email. Please sign up first.',
                'code': 'user_not_found'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({
                'detail': 'An error occurred while processing your request. Please try again.',
                'code': 'server_error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def get(self, request):
        email = request.query_params.get('email', '')
        token = request.query_params.get('token', '')
        user = get_object_or_404(User, email=email)

        try:
            f = ForgetPassword.objects.get(user=user,code=token)
            user.password=f.new_password
            user.save()
            
            return user.generate_login_response()
        except:
            return Response({'detail': 'Invalid Code.'}, status=status.HTTP_400_BAD_REQUEST)
    

class LogoutAPIView(APIView):
    authentication_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        response.delete_cookie('token', domain=settings.COOKIE_DOMAIN)
        return response