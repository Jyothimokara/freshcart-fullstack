from rest_framework import serializers
from apps.products.models import Product
from .models import WishlistItem

class WishlistToggleSerializer(serializers.Serializer):
    """Serializer for toggling a product in the wishlist."""
    productId = serializers.CharField(source='product_id')

    def validate_productId(self, value):
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Product does not exist.")
        return value
