from django.urls import path, include
from rest_framework.routers import DefaultRouter
from myapp.api import ExpenseViewSet, CategoryViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('', include(router.urls)),
]