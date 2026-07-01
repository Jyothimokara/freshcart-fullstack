from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """API ViewSet to list and retrieve product categories."""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """API ViewSet to list and retrieve products with advanced search, filtering, and sorting."""
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Fetch active products
        queryset = Product.objects.filter(is_active=True).select_related('category')
        
        # 1. Filter by Category Slug
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
            
        # 2. Filter by Search Query (name or description)
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | 
                Q(description__icontains=search_query)
            )
            
        # 3. Filter for Deals (products with a discount price)
        deals_only = self.request.query_params.get('deals')
        if deals_only and deals_only.lower() in ('true', '1', 't'):
            queryset = queryset.filter(discount_price__isnull=False)
            
        # 4. Handle Sorting / Ordering
        ordering = self.request.query_params.get('ordering')
        if ordering:
            # Handle sorting directions
            if ordering == 'price':
                # Order by price ascending
                queryset = queryset.order_by('price')
            elif ordering == '-price':
                # Order by price descending
                queryset = queryset.order_by('-price')
            elif ordering == 'rating':
                # Order by rating descending (highest first)
                queryset = queryset.order_by('-rating')
            else:
                # Fallback for standard field ordering
                queryset = queryset.order_by(ordering)
                
        return queryset
