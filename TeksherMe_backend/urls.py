from django.contrib import admin
from django.urls import path, include, re_path
from django.shortcuts import redirect
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.http import HttpResponseNotFound
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# Simple 404 view for non-website paths
def not_found(request):
    return HttpResponseNotFound("<h1>Page not found</h1>")

urlpatterns = [
    # Admin routes
    path('admin/', admin.site.urls),
    path('admin-panel/', lambda request: redirect('admin:index'), name='admin-panel'),
    
    # API endpoints
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
    
    # Serve PWA manifest and icons
    path('manifest.json', serve, {'document_root': settings.BASE_DIR / 'website/build', 'path': 'manifest.json'}),
    path('favicon.ico', serve, {'document_root': settings.BASE_DIR / 'website/build', 'path': 'favicon.ico'}),
    path('logo192.png', serve, {'document_root': settings.BASE_DIR / 'website/build', 'path': 'logo192.png'}),
    path('logo512.png', serve, {'document_root': settings.BASE_DIR / 'website/build', 'path': 'logo512.png'}),
    
    # Website routes - only serve React app at the /website path
    path('website/', TemplateView.as_view(template_name='index.html'), name='website'),
    # Handle all nested paths under /website/ to serve the React app
    re_path(r'^website/.*$', TemplateView.as_view(template_name='index.html')),
    
    # Root path redirects to website
    path('', lambda request: redirect('website'), name='root-redirect'),
    
    # Return 404 for any other paths
    re_path(r'^.*$', not_found),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
