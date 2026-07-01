from django.contrib import admin
from .models import WishlistItem

class WishlistItemAdmin(admin.ModelAdmin):
    """Admin configuration for WishlistItems."""
    list_display = ('user', 'product', 'created_at')
    search_fields = ('user__email', 'product__name')
    raw_id_fields = ('user', 'product')

admin.site.register(WishlistItem, WishlistItemAdmin)
