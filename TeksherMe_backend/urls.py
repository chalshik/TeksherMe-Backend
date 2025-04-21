from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Your API endpoints
    path('api/v1/', include([
        path('categories/', include('categories.urls')),
        path('testsets/', include('testsets.urls')),
        path('attempts/', include('attempts.urls')),
        path('bookmarks/', include('bookmarks.urls')),
    ])),

    path('api-auth/', include('rest_framework.urls')),

    # OpenAPI schema and docs
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
