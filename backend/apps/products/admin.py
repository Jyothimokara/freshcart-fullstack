from django.contrib import admin
from .models import Category, Product

class CategoryAdmin(admin.ModelAdmin):
    """Admin layout for Categories."""
    list_display = ('name', 'slug', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'slug')

class ProductAdmin(admin.ModelAdmin):
    """Admin layout for Products."""
    list_display = ('name', 'category', 'price', 'discount_price', 'stock', 'unit', 'rating', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')
    raw_id_fields = ('category',)

admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
