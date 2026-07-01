from rest_framework import status, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.products.models import Product
from .models import Cart, CartItem, Coupon
from .serializers import CartSerializer, CartItemSerializer

def get_or_create_user_cart(user):
    """Helper to fetch or instantiate a User's Cart."""
    cart, created = Cart.objects.get_or_create(user=user)
    return cart

class CartView(APIView):
    """API View to fetch or merge a user's shopping cart."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        cart = get_or_create_user_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """Action to merge items from local storage cart upon logging in."""
        cart = get_or_create_user_cart(request.user)
        local_items = request.data.get('items', [])
        
        # Expected local_items structure: [{"productId": "f1", "quantity": 2}, ...]
        for item_data in local_items:
            product_id = item_data.get('productId')
            quantity = int(item_data.get('quantity', 1))
            
            try:
                product = Product.objects.get(id=product_id, is_active=True)
                cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
                
                if created:
                    cart_item.quantity = min(product.stock, quantity)
                else:
                    cart_item.quantity = min(product.stock, cart_item.quantity + quantity)
                
                if cart_item.quantity > 0:
                    cart_item.save()
                else:
                    cart_item.delete()
            except Product.DoesNotExist:
                continue
                
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CartItemViewSet(viewsets.ModelViewSet):
    """ViewSet to perform operations on individual Cart Items."""
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        cart = get_or_create_user_cart(self.request.user)
        return CartItem.objects.filter(cart=cart).select_related('product')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        cart = get_or_create_user_cart(request.user)
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        cart = get_or_create_user_cart(self.request.user)
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)
        
        # If item already exists, increment quantity (up to stock)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if created:
            cart_item.quantity = min(product.stock, quantity)
        else:
            cart_item.quantity = min(product.stock, cart_item.quantity + quantity)
            
        cart_item.save()
        
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        quantity = int(request.data.get('quantity', instance.quantity))
        
        if quantity <= 0:
            instance.delete()
            cart = get_or_create_user_cart(request.user)
            return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
            
        # Ensure quantity does not exceed product stock limits
        product = instance.product
        instance.quantity = min(product.stock, quantity)
        instance.save()
        
        cart = get_or_create_user_cart(request.user)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        cart = get_or_create_user_cart(request.user)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

class ApplyCouponView(APIView):
    """API View to apply a coupon code to the user's active cart."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        code = request.data.get('code', '').upper().strip()
        cart = get_or_create_user_cart(request.user)
        
        try:
            coupon = Coupon.objects.get(code=code)
            if not coupon.is_valid():
                return Response({"detail": "Coupon has expired or is inactive."}, status=status.HTTP_400_BAD_REQUEST)
                
            cart.coupon = coupon
            cart.save()
            
            serializer = CartSerializer(cart)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Coupon.DoesNotExist:
            return Response({"detail": "Invalid coupon code."}, status=status.HTTP_400_BAD_REQUEST)

class RemoveCouponView(APIView):
    """API View to detach the active coupon from the user's active cart."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cart = get_or_create_user_cart(request.user)
        cart.coupon = None
        cart.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ClearCartView(APIView):
    """API View to flush all items and coupons from the user's active cart."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cart = get_or_create_user_cart(request.user)
        CartItem.objects.filter(cart=cart).delete()
        cart.coupon = None
        cart.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)
