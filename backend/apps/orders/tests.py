from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.products.models import Category, Product
from apps.cart.models import Cart, CartItem, Coupon
from apps.orders.models import Order, OrderItem
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class OrderCheckoutTests(APITestCase):
    """Test suite for checking out shopping carts and generating orders."""
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            email='shopper@example.com',
            name='Shopper',
            password='password123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        # Create product
        self.category = Category.objects.create(
            name='Fruits', slug='fruits', image='http://example.com/cat.jpg'
        )
        self.product = Product.objects.create(
            id='f1',
            category=self.category,
            name='Fresh Apples',
            price=2.00,
            stock=10,
            image='http://example.com/apples.jpg'
        )

        # Create cart
        self.cart, _ = Cart.objects.get_or_create(user=self.user)
        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )

        # Create coupon
        self.coupon = Coupon.objects.create(
            code='FRESH15',
            discount_percentage=15.00,
            is_active=True,
            valid_from=timezone.now() - timezone.timedelta(days=1),
            valid_to=timezone.now() + timezone.timedelta(days=10)
        )

    def test_checkout_success(self):
        # Apply coupon to user's cart
        self.cart.coupon = self.coupon
        self.cart.save()

        # Checkout payload
        address_payload = {
            'fullName': 'Jane Shopper',
            'phone': '555-0000',
            'street': '123 E-Commerce Blvd',
            'city': 'San Jose',
            'state': 'CA',
            'zipCode': '95112'
        }
        checkout_data = {
            'address': address_payload,
            'paymentMethod': 'Credit Card (ending in 4242)'
        }

        # Run checkout request
        response = self.client.post('/api/orders/checkout/', checkout_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify order details
        order_id = response.data['id']
        self.assertTrue(Order.objects.filter(id=order_id).exists())
        order = Order.objects.get(id=order_id)
        
        # Math verification:
        # Original subtotal = $2.00 * 2 = $4.00
        # Discount = 15% of $4.00 = $0.60
        # Shipping = $5.99 (tempSubtotal is $3.40 which is < $35)
        # Tax = $3.40 * 0.08 = $0.272 (rounded in response to 0.27)
        # Total = $3.40 + $0.272 + $5.99 = $9.66
        self.assertAlmostEqual(float(order.subtotal), 4.00)
        self.assertAlmostEqual(float(order.discount), 0.60)
        self.assertAlmostEqual(float(order.shipping), 5.99)
        self.assertAlmostEqual(float(order.tax), 0.27)
        self.assertAlmostEqual(float(order.total), 9.66)

        # Verify stock reduction: 10 - 2 = 8
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 8)

        # Verify cart was cleared
        self.cart.refresh_from_db()
        self.assertFalse(CartItem.objects.filter(cart=self.cart).exists())
        self.assertIsNone(self.cart.coupon)

    def test_checkout_insufficient_stock(self):
        # Update cart quantity to exceed stock
        self.cart_item.quantity = 15
        self.cart_item.save()

        address_payload = {
            'fullName': 'Jane Shopper',
            'phone': '555-0000',
            'street': '123 E-Commerce Blvd',
            'city': 'San Jose',
            'state': 'CA',
            'zipCode': '95112'
        }
        checkout_data = {
            'address': address_payload,
            'paymentMethod': 'Credit Card'
        }

        response = self.client.post('/api/orders/checkout/', checkout_data, format='json')
        # Should fail with bad request (stock lock validation)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Insufficient stock', response.data['detail'])

        # Stock should remain untouched
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)

    def test_update_order_status(self):
        # Create an order first
        order = Order.objects.create(
            user=self.user,
            subtotal=10.00,
            shipping=0.00,
            discount=0.00,
            tax=0.80,
            total=10.80,
            payment_method='COD',
            shipping_address_snapshot={'fullName': 'Test User'}
        )
        
        # Test PATCH status
        response = self.client.patch(f'/api/orders/{order.id}/status/', {'status': 'Shipped'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, 'Shipped')
        self.assertEqual(response.data['status'], 'Shipped')

        # Test invalid status choice
        response = self.client.patch(f'/api/orders/{order.id}/status/', {'status': 'InvalidStatus'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
