from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', include('myapp.urls')),
    path('api/', include('myapp.api_urls')),
    path('api-auth/', include('rest_framework.urls')),
]
