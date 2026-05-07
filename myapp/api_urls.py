from django.urls import path, include
from rest_framework.routers import DefaultRouter
from myapp.api import (
    ExpenseViewSet, CategoryViewSet, SubscriptionViewSet,
    api_csrf, api_login, api_logout, api_me,
    api_dashboard,
)

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/csrf/', api_csrf, name='api_csrf'),
    path('auth/login/', api_login, name='api_login'),
    path('auth/logout/', api_logout, name='api_logout'),
    path('auth/me/', api_me, name='api_me'),
    path('dashboard/', api_dashboard, name='api_dashboard'),
]