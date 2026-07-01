from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ('product',)
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    """Admin configuration for Orders."""
    list_display = ('id', 'user', 'date', 'status', 'total', 'payment_method', 'payment_status')
    list_filter = ('status', 'payment_status', 'date')
    search_fields = ('id', 'user__email', 'shipping_address_snapshot')
    inlines = [OrderItemInline]
    readonly_fields = ('id', 'date', 'subtotal', 'shipping', 'discount', 'tax', 'total')

admin.site.register(Order, OrderAdmin)
