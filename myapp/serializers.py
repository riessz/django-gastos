from django.utils import timezone
from rest_framework import serializers
from myapp.models import Expense, Category, Subscription, SubscriptionPayment

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'category', 'category_name', 'date', 'description']
        read_only_fields = ['id', 'category_name']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']
        read_only_fields = ['id']

class SubscriptionSerializer(serializers.ModelSerializer):
    paid_this_month = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = ['id', 'name', 'amount', 'billing_day', 'active', 'paid_this_month']
        read_only_fields = ['id', 'paid_this_month']

    def get_paid_this_month(self, obj):
        hoje = timezone.now()
        return SubscriptionPayment.objects.filter(
            subscription=obj, month=hoje.month, year=hoje.year, paid=True
        ).exists()
