from rest_framework import status
from rest_framework.test import APITestCase
from apps.products.models import Category, Product

class ProductTests(APITestCase):
    """Test suite for Category and Product search, filtering, and catalog queries."""
    def setUp(self):
        self.category = Category.objects.create(
            name='Test Category',
            slug='test-category',
            image='http://example.com/cat.jpg'
        )
        self.product = Product.objects.create(
            id='p1',
            category=self.category,
            name='Apple',
            price=2.99,
            stock=10,
            image='http://example.com/apple.jpg'
        )
        self.deal_product = Product.objects.create(
            id='p2',
            category=self.category,
            name='Banana',
            price=1.99,
            discount_price=1.49,
            stock=20,
            image='http://example.com/banana.jpg'
        )

    def test_category_list(self):
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['slug'], 'test-category')

    def test_product_list(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_product_search(self):
        response = self.client.get('/api/products/?search=Apple')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Apple')

    def test_deals_filter(self):
        response = self.client.get('/api/products/?deals=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Banana')
