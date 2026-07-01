from decimal import Decimal
from rest_framework import status, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.cart.models import Cart, CartItem
from apps.products.models import Product
from .models import Order, OrderItem
from .serializers import OrderSerializer, CheckoutSerializer

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet to retrieve order history and order details for the authenticated user."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own orders
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if not new_status:
            return Response({"detail": "Status field is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({"detail": f"Invalid status. Must be one of {valid_statuses}."}, status=status.HTTP_400_BAD_REQUEST)
            
        order.status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CheckoutView(APIView):
    """API View to handle checking out and placing an order using database-level locks."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        address_snapshot = serializer.validated_data['address']
        payment_method = serializer.validated_data['payment_method']

        try:
            # Wrap checkout inside an atomic database transaction
            with transaction.atomic():
                # 1. Fetch user's cart
                cart = Cart.objects.filter(user=request.user).first()
                if not cart or not cart.items.exists():
                    return Response({"detail": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

                cart_items = list(cart.items.all().select_related('product'))
                
                # 2. Lock product records to prevent race conditions (double-selling)
                product_ids = [item.product.id for item in cart_items]
                # Lock rows in DB using select_for_update()
                locked_products = {
                    p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
                }

                # 3. Verify stock availability and deduct inventory
                order_items_to_create = []
                subtotal = Decimal('0.00')

                for item in cart_items:
                    product = locked_products.get(item.product.id)
                    if not product:
                        return Response({"detail": f"Product '{item.product.name}' is no longer available."}, status=status.HTTP_400_BAD_REQUEST)

                    if product.stock < item.quantity:
                        return Response({
                            "detail": f"Insufficient stock for '{product.name}'. Only {product.stock} items left, but you requested {item.quantity}."
                        }, status=status.HTTP_400_BAD_REQUEST)

                    # Deduct stock
                    product.stock -= item.quantity
                    product.save()

                    # Calculate price at checkout
                    active_price = product.discount_price if product.discount_price is not None else product.price
                    subtotal += active_price * item.quantity

                    # Prepare OrderItem database object
                    order_items_to_create.append(OrderItem(
                        product=product,
                        product_name=product.name,
                        price=active_price,
                        quantity=item.quantity,
                        image=product.image
                    ))

                # 4. Perform financial calculations (Source of Truth)
                discount = Decimal('0.00')
                if cart.coupon and cart.coupon.is_valid():
                    discount = subtotal * (cart.coupon.discount_percentage / Decimal('100.00'))
                    if cart.coupon.max_discount_amount:
                        discount = min(discount, cart.coupon.max_discount_amount)

                temp_subtotal = max(Decimal('0.00'), subtotal - discount)
                
                shipping = Decimal('0.00')
                if temp_subtotal > 0 and temp_subtotal < Decimal('35.00'):
                    shipping = Decimal('5.99')

                tax = temp_subtotal * Decimal('0.08')
                total = temp_subtotal + tax + shipping

                # 5. Create Order record
                order = Order.objects.create(
                    user=request.user,
                    status='Processing',
                    subtotal=subtotal,
                    shipping=shipping,
                    discount=discount,
                    tax=tax,
                    total=total,
                    payment_method=payment_method,
                    payment_status='Paid',  # Mock successful payment
                    shipping_address_snapshot=address_snapshot
                )

                # 6. Associate items and bulk create OrderItems
                for item in order_items_to_create:
                    item.order = order
                OrderItem.objects.bulk_create(order_items_to_create)

                # 7. Clear the shopping cart
                cart.items.all().delete()
                cart.coupon = None
                cart.save()

                # Return serialized order details on success
                response_serializer = OrderSerializer(order)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"detail": f"An error occurred during checkout: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
