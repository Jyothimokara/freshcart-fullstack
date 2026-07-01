from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from apps.products.models import Category, Product
from apps.wishlist.models import WishlistItem

User = get_user_model()

class WishlistAPITests(APITestCase):
    """Test suite verifying Wishlist endpoints, toggling items, clearing list, and authorization constraints."""

    def setUp(self):
        # Create Category and Products
        self.category = Category.objects.create(
            name='Snacks',
            slug='snacks',
            image='http://example.com/snacks.jpg'
        )
        self.product1 = Product.objects.create(
            id='p1',
            category=self.category,
            name='Organic Tortilla Chips',
            price=3.99,
            stock=15,
            image='http://example.com/chips.jpg'
        )
        self.product2 = Product.objects.create(
            id='p2',
            category=self.category,
            name='Mixed Nuts',
            price=5.49,
            stock=25,
            image='http://example.com/nuts.jpg'
        )

        # Create User & Authenticate Client
        self.user = User.objects.create_user(
            email='wishlister@example.com',
            name='Wish List Guy',
            password='password123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_anonymous_user_blocked(self):
        """Unauthenticated requests to Wishlist must receive 401 response."""
        self.client.credentials()  # Clear authorization
        
        response = self.client.get('/api/wishlist/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.post('/api/wishlist/', {'productId': 'p1'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_empty_wishlist(self):
        """A new user gets an empty wishlist (empty array)."""
        response = self.client.get('/api/wishlist/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_toggle_add_and_remove_wishlist(self):
        """POST /api/wishlist/ toggles product existence in user's wishlist."""
        # 1. Add item
        response1 = self.client.post('/api/wishlist/', {'productId': 'p1'}, format='json')
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response1.data, ['p1'])
        self.assertTrue(WishlistItem.objects.filter(user=self.user, product_id='p1').exists())

        # 2. Toggle again to remove it
        response2 = self.client.post('/api/wishlist/', {'productId': 'p1'}, format='json')
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.data, [])
        self.assertFalse(WishlistItem.objects.filter(user=self.user, product_id='p1').exists())

    def test_clear_wishlist(self):
        """POST /api/wishlist/ with action: 'clear' empties all user's wishlisted items."""
        # Add two items
        self.client.post('/api/wishlist/', {'productId': 'p1'}, format='json')
        self.client.post('/api/wishlist/', {'productId': 'p2'}, format='json')
        self.assertEqual(WishlistItem.objects.filter(user=self.user).count(), 2)

        # Clear
        response = self.client.post('/api/wishlist/', {'action': 'clear'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])
        self.assertEqual(WishlistItem.objects.filter(user=self.user).count(), 0)
