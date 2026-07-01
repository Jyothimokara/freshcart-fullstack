from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.authentication.models import Address

User = get_user_model()

class AuthTests(APITestCase):
    """Test suite for authentication APIs."""
    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.profile_url = reverse('auth_profile')
        self.user_data = {
            'email': 'test@example.com',
            'name': 'Test User',
            'password': 'password123'
        }

    def test_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['email'], self.user_data['email'])

    def test_login(self):
        # Register user first
        self.client.post(self.register_url, self.user_data)
        
        # Try login
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)

    def test_profile_retrieval(self):
        # Register and login
        reg_response = self.client.post(self.register_url, self.user_data)
        token = reg_response.data['tokens']['access']
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.user_data['name'])

class AddressTests(APITestCase):
    """Test suite for Address APIs."""
    def setUp(self):
        self.user = User.objects.create_user(
            email='user@example.com',
            name='Regular User',
            password='password123'
        )
        # Auth header configuration
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Base url
        self.address_list_url = '/api/addresses/'

    def test_create_address(self):
        data = {
            'fullName': 'Jane Smith',
            'phone': '+1234567890',
            'street': '789 Oak Ave',
            'city': 'Boston',
            'state': 'MA',
            'zipCode': '02108',
            'isDefault': False
        }
        response = self.client.post(self.address_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['fullName'], data['fullName'])
        # The first address must be set to default automatically by model save logic
        self.assertTrue(response.data['isDefault'])
