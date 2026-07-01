from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from apps.products.models import Category, Product
from apps.cart.models import Cart, CartItem, Coupon

User = get_user_model()

class CartAPITests(APITestCase):
    """Test suite verifying Cart endpoints, coupon behaviors, and authentication constraints."""
    
    def setUp(self):
        # Create Category and Products
        self.category = Category.objects.create(
            name='Fresh Produce',
            slug='fresh-produce',
            image='http://example.com/cat.jpg'
        )
        self.product1 = Product.objects.create(
            id='p1',
            category=self.category,
            name='Apple',
            price=2.00,
            stock=50,
            image='http://example.com/apple.jpg'
        )
        self.product2 = Product.objects.create(
            id='p2',
            category=self.category,
            name='Banana',
            price=1.50,
            stock=20,
            image='http://example.com/banana.jpg'
        )
        
        # Create User & Authenticate client
        self.user = User.objects.create_user(
            email='shopper@example.com',
            name='Shopper McShop',
            password='password123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Coupon setup
        self.coupon = Coupon.objects.create(
            code='SAVE10',
            discount_percentage=10.00,
            is_active=True,
            valid_from=timezone.now() - timezone.timedelta(days=1),
            valid_to=timezone.now() + timezone.timedelta(days=10)
        )

    def test_anonymous_user_blocked(self):
        """Unauthenticated requests must receive 401 response."""
        self.client.credentials()  # Clear auth token
        
        response = self.client.get('/api/cart/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.post('/api/cart/items/', {'productId': 'p1', 'quantity': 1})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_empty_cart(self):
        """A user gets an empty cart with zeroed totals when first requested."""
        response = self.client.get('/api/cart/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 0)
        self.assertEqual(response.data['subtotal'], 0.00)
        self.assertEqual(response.data['total'], 0.00)

    def test_add_item_to_cart(self):
        """POST /api/cart/items/ successfully adds a product to the database cart."""
        response = self.client.post('/api/cart/items/', {'productId': 'p1', 'quantity': 2}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data['items']), 1)
        
        item = response.data['items'][0]
        self.assertEqual(item['product']['name'], 'Apple')
        self.assertEqual(item['quantity'], 2)
        self.assertEqual(response.data['subtotal'], 4.00)

    def test_update_item_quantity(self):
        """PATCH /api/cart/items/<id>/ successfully updates quantity and recalculates totals."""
        # Add item first
        add_res = self.client.post('/api/cart/items/', {'productId': 'p2', 'quantity': 1}, format='json')
        item_id = add_res.data['items'][0]['id']
        
        # Update quantity
        update_res = self.client.patch(f'/api/cart/items/{item_id}/', {'quantity': 5}, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_res.data['items'][0]['quantity'], 5)
        self.assertEqual(update_res.data['subtotal'], 7.50)

    def test_remove_item_from_cart(self):
        """DELETE /api/cart/items/<id>/ successfully deletes item from database."""
        add_res = self.client.post('/api/cart/items/', {'productId': 'p1', 'quantity': 1}, format='json')
        item_id = add_res.data['items'][0]['id']
        
        delete_res = self.client.delete(f'/api/cart/items/{item_id}/')
        self.assertEqual(delete_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(delete_res.data['items']), 0)
        self.assertEqual(delete_res.data['subtotal'], 0.00)

    def test_apply_and_remove_coupon(self):
        """Applying coupon applies discount percent; removing coupon detaches it."""
        # Add item to cart to exceed $35 for free shipping
        self.client.post('/api/cart/items/', {'productId': 'p1', 'quantity': 20}, format='json') # subtotal: 40.00
        
        # Apply coupon
        coupon_res = self.client.post('/api/cart/apply-coupon/', {'code': 'SAVE10'}, format='json')
        self.assertEqual(coupon_res.status_code, status.HTTP_200_OK)
        self.assertEqual(coupon_res.data['discount'], 4.00) # 10% of 40.00
        self.assertEqual(coupon_res.data['appliedCoupon'], 'SAVE10')
        
        # Remove coupon
        remove_res = self.client.post('/api/cart/remove-coupon/')
        self.assertEqual(remove_res.status_code, status.HTTP_200_OK)
        self.assertEqual(remove_res.data['discount'], 0.00)
        self.assertIsNone(remove_res.data['appliedCoupon'])
