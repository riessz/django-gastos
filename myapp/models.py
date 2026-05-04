
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class Expense(models.Model):
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"

class Subscription(models.Model):
    name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    billing_day = models.IntegerField()
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class SubscriptionPayment(models.Model):
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='payments')
    month = models.IntegerField()
    year = models.IntegerField()
    paid = models.BooleanField(default=False)

    class Meta:
        unique_together = ['subscription', 'month', 'year']

