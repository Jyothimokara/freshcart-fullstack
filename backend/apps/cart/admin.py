from django.contrib import admin
from .models import Coupon, Cart, CartItem

class CouponAdmin(admin.ModelAdmin):
    """Admin layout for Coupons."""
    list_display = ('code', 'discount_percentage', 'max_discount_amount', 'is_active', 'valid_from', 'valid_to')
    list_filter = ('is_active', 'valid_from', 'valid_to')
    search_fields = ('code',)

class CartItemInline(admin.TabularInline):
    model = CartItem
    raw_id_fields = ('product',)
    extra = 0

class CartAdmin(admin.ModelAdmin):
    """Admin layout for Carts."""
    list_display = ('user', 'coupon')
    search_fields = ('user__email',)
    raw_id_fields = ('user', 'coupon')
    inlines = [CartItemInline]

admin.site.register(Coupon, CouponAdmin)
admin.site.register(Cart, CartAdmin)
