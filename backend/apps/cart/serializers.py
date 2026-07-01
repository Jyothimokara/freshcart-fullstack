from decimal import Decimal
from rest_framework import serializers
from apps.products.models import Product
from apps.products.serializers import ProductSerializer
from .models import Cart, CartItem, Coupon

class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for CartItems, nesting the full Product detail and matching camelCase."""
    product = ProductSerializer(read_only=True)
    productId = serializers.PrimaryKeyRelatedField(
        source='product',
        queryset=Product.objects.filter(is_active=True),
        write_only=True
    )

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'productId', 'quantity']
        read_only_fields = ['id']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value

class CartSerializer(serializers.ModelSerializer):
    """Serializer for Carts, computing financials and discounts dynamically."""
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    shipping = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    appliedCoupon = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'subtotal', 'tax', 'shipping', 'discount', 'total', 'appliedCoupon']
        read_only_fields = ['id']

    def _get_financials(self, obj):
        """Helper to compute subtotal, discount, tax, shipping, and total."""
        items = obj.items.all().select_related('product')
        
        # Calculate subtotal
        subtotal = sum(
            (item.product.discount_price if item.product.discount_price is not None else item.product.price) * item.quantity
            for item in items
        )
        # Ensure subtotal is a Decimal (if empty, sum() returns 0 which is an int, let's cast)
        subtotal = Decimal(str(subtotal))
        
        # Calculate discount from coupon
        discount = Decimal('0.00')
        if obj.coupon and obj.coupon.is_valid():
            discount = subtotal * (obj.coupon.discount_percentage / Decimal('100.00'))
            if obj.coupon.max_discount_amount:
                discount = min(discount, obj.coupon.max_discount_amount)
                
        # Subtotal after discount
        temp_subtotal = max(Decimal('0.00'), subtotal - discount)
        
        # Calculate shipping (Free shipping over $35, or if cart is empty)
        shipping = Decimal('0.00')
        if temp_subtotal > 0 and temp_subtotal < Decimal('35.00'):
            shipping = Decimal('5.99')
            
        # Calculate tax (8%)
        tax = temp_subtotal * Decimal('0.08')
        
        # Calculate total
        total = temp_subtotal + tax + shipping
        
        return {
            'subtotal': round(float(subtotal), 2),
            'discount': round(float(discount), 2),
            'shipping': float(shipping),
            'tax': round(float(tax), 2),
            'total': round(float(total), 2)
        }

    def get_subtotal(self, obj):
        return self._get_financials(obj)['subtotal']

    def get_discount(self, obj):
        return self._get_financials(obj)['discount']

    def get_shipping(self, obj):
        return self._get_financials(obj)['shipping']

    def get_tax(self, obj):
        return self._get_financials(obj)['tax']

    def get_total(self, obj):
        return self._get_financials(obj)['total']

    def get_appliedCoupon(self, obj):
        return obj.coupon.code if obj.coupon else None
