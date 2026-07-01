import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.products.models import Product

User = get_user_model()

class Coupon(models.Model):
    """Model representing promotional coupons."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage discount, e.g. 15.00 for 15%")
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()

    def is_valid(self):
        """Checks if the coupon is currently valid based on status and dates."""
        now = timezone.now()
        return self.is_active and self.valid_from <= now <= self.valid_to

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}%)"

class Cart(models.Model):
    """Model representing a user's shopping cart."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name='carts')

    def __str__(self):
        return f"Cart of {self.user.email}"

class CartItem(models.Model):
    """Model representing items within a user's cart."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('cart', 'product')
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in {self.cart}"
