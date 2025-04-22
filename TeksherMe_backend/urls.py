from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse, HttpResponseNotFound

# Simple API documentation views
def api_schema(request):
    return HttpResponse("<h1>API Schema</h1><p>API documentation is temporarily disabled.</p>")

def swagger_ui(request):
    return HttpResponse("<h1>Swagger UI</h1><p>Swagger UI is temporarily disabled.</p>")

def redoc_view(request):
    return HttpResponse("<h1>ReDoc</h1><p>ReDoc is temporarily disabled.</p>")

urlpatterns = [
    # Admin routes
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/v1/', include([
        path('categories/', include('categories.urls')),
        path('testsets/', include('testsets.urls')),
        path('attempts/', include('attempts.urls')),
        path('bookmarks/', include('bookmarks.urls')),
    ])),
    
    path('api-auth/', include('rest_framework.urls')),

    # Simple API documentation endpoints
    path('schema/', api_schema, name='schema'),
    path('swagger/', swagger_ui, name='swagger-ui'),
    path('redoc/', redoc_view, name='redoc'),
    
    # Return 404 for any other paths
    re_path(r'^.*$', HttpResponseNotFound)
]
