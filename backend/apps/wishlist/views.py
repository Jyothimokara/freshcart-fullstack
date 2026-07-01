from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.products.models import Product
from .models import WishlistItem
from .serializers import WishlistToggleSerializer

class WishlistView(APIView):
    """API View to retrieve, toggle, and clear wishlist items."""
    permission_classes = [permissions.IsAuthenticated]

    def _get_wishlist_ids(self, user):
        """Helper to get a list of product IDs in the user's wishlist."""
        return list(WishlistItem.objects.filter(user=user).values_list('product_id', flat=True))

    def get(self, request, *args, **kwargs):
        """Get list of product IDs in the user's wishlist."""
        ids = self._get_wishlist_ids(request.user)
        return Response(ids, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """Toggle a product's presence in the user's wishlist."""
        # Check if this is a toggle or clear action
        action = request.data.get('action')
        
        if action == 'clear':
            WishlistItem.objects.filter(user=request.user).delete()
            return Response([], status=status.HTTP_200_OK)
            
        # Standard toggle behavior
        serializer = WishlistToggleSerializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            product = Product.objects.get(id=product_id)
            
            # Toggle the wishlist item
            wishlist_item = WishlistItem.objects.filter(user=request.user, product=product)
            if wishlist_item.exists():
                wishlist_item.delete()
            else:
                WishlistItem.objects.create(user=request.user, product=product)
                
            updated_ids = self._get_wishlist_ids(request.user)
            return Response(updated_ids, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
