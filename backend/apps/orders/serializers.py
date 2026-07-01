from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItems, mapping properties to camelCase frontend keys."""
    productId = serializers.CharField(source='product_id', allow_null=True)
    productName = serializers.CharField(source='product_name')

    class Meta:
        model = OrderItem
        fields = ['productId', 'productName', 'price', 'quantity', 'image']

class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Orders, providing the address snapshot and nesting items."""
    items = OrderItemSerializer(many=True, read_only=True)
    paymentMethod = serializers.CharField(source='payment_method')
    address = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'date', 'status', 'items', 'subtotal', 
            'shipping', 'discount', 'tax', 'total', 'address', 'paymentMethod'
        ]
        read_only_fields = ['id', 'date', 'status']

    def get_address(self, obj):
        # Return the saved snapshot of the shipping address
        return obj.shipping_address_snapshot

class CheckoutSerializer(serializers.Serializer):
    """Serializer validating incoming checkout/order placement requests."""
    address = serializers.JSONField(help_text="Full address object or snapshot")
    paymentMethod = serializers.CharField(source='payment_method')
