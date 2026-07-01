from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Categories, including dynamic item count calculations."""
    itemCount = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'itemCount']
        read_only_fields = ['id', 'itemCount']

    def get_itemCount(self, obj):
        # Return count of active products in this category
        return obj.products.filter(is_active=True).count()

class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Products, with slug-based Category mapping and camelCase fields."""
    category = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Category.objects.all()
    )
    discountPrice = serializers.DecimalField(
        source='discount_price',
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'image', 'price', 
            'discountPrice', 'rating', 'stock', 'unit', 'description'
        ]
        read_only_fields = ['id']
