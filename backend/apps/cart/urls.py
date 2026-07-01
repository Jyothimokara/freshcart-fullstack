from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartView, CartItemViewSet, ApplyCouponView, RemoveCouponView, ClearCartView

router = DefaultRouter()
router.register(r'items', CartItemViewSet, basename='cart-item')

urlpatterns = [
    path('', CartView.as_view(), name='cart'),
    path('apply-coupon/', ApplyCouponView.as_view(), name='cart-apply-coupon'),
    path('remove-coupon/', RemoveCouponView.as_view(), name='cart-remove-coupon'),
    path('clear/', ClearCartView.as_view(), name='cart-clear'),
    path('', include(router.urls)),
]
