from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.authentication.views import ProfileView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/profile/', ProfileView.as_view(), name='profile'),
    path('api/auth/', include('apps.authentication.urls_auth')),
    path('api/addresses/', include('apps.authentication.urls_addresses')),
    path('api/', include('apps.products.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/wishlist/', include('apps.wishlist.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
