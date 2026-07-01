from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Address

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model."""
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'avatar']
        read_only_fields = ['id', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration requests."""
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['name', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
        return user

class AddressSerializer(serializers.ModelSerializer):
    """Serializer for Addresses, mapping database snake_case to frontend camelCase."""
    fullName = serializers.CharField(source='full_name')
    zipCode = serializers.CharField(source='zip_code')
    isDefault = serializers.BooleanField(source='is_default', required=False)

    class Meta:
        model = Address
        fields = ['id', 'fullName', 'phone', 'street', 'city', 'state', 'zipCode', 'isDefault']
        read_only_fields = ['id']

    def create(self, validated_data):
        # Attach the authenticated user from the context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
