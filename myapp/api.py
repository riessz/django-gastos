from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from myapp.models import Expense, Category, Subscription
from myapp.serializers import ExpenseSerializer, CategorySerializer, SubscriptionSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer


