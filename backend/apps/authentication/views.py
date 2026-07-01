from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import Address
from .serializers import UserSerializer, RegisterSerializer, AddressSerializer

User = get_user_model()

def get_tokens_for_user(user):
    """Utility to generate JWT access and refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom SimpleJWT serializer that embeds the user profile alongside tokens."""
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user serializer representation
        data['user'] = UserSerializer(self.user).data
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    """Token obtain view returning tokens and user profile."""
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    """API View for registering a new user."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            return Response({
                'user': user_data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """API View to logout user by blacklisting their refresh token."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_244_NO_CONTENT or status.HTTP_200_OK or status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(RetrieveUpdateAPIView):
    """API View to retrieve or update authenticated user profile information."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class AddressViewSet(viewsets.ModelViewSet):
    """API ViewSet for managing user addresses."""
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only query/interact with their own addresses
        return Address.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        """Sets the selected address as the default shipping address."""
        address = self.get_object()
        address.is_default = True
        address.save()
        
        # Serialize the updated addresses of this user and return
        addresses = self.get_queryset()
        serializer = self.get_serializer(addresses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
