import uuid
import random
from django.db import models
from django.contrib.auth import get_user_model
from apps.products.models import Product

User = get_user_model()

class Order(models.Model):
    """Model representing finalized customer orders."""
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )

    # Custom order format like FC-XXXXX
    id = models.CharField(primary_key=True, max_length=20, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Processing')
    
    # Financial fields
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    payment_method = models.CharField(max_length=100)
    payment_status = models.CharField(max_length=50, default='Pending')
    
    # Shipping Address snapshot to protect history from profile modifications
    shipping_address_snapshot = models.JSONField(help_text="Snapshot of the shipping address at checkout")

    class Meta:
        ordering = ['-date']

    def save(self, *args, **kwargs):
        if not self.id:
            # Generate a unique FC-XXXXX order number
            while True:
                num = random.randint(10000, 99999)
                candidate_id = f"FC-{num}"
                if not Order.objects.filter(id=candidate_id).exists():
                    self.id = candidate_id
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.id} for {self.user.email}"

class OrderItem(models.Model):
    """Model representing an item purchased within an order."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Snapshots to maintain historical records
    product_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    image = models.CharField(max_length=500)

    def __str__(self):
        return f"{self.quantity} x {self.product_name} in {self.order.id}"
