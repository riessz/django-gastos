from django.shortcuts import render, redirect
from datetime import datetime
from .forms import AddItemForm
from .models import Expense, Subscription

def home(request):
    expenses = Expense.objects.order_by('-date')[:10]
    subscriptions = Subscription.objects.filter(active=True)

    total_expense = sum(e.amount for e in Expense.objects.all())
    total_subscription = sum(s.amount for s in subscriptions)

    context = {
        'current_date': datetime.now(),
        'expenses': expenses,
        'subscriptions': subscriptions,
        'total_expense': total_expense,
        'total_subscription': total_subscription,
    }
    return render(request, 'myapp/home.html', context)

def add_item(request):
    if request.method == 'POST':
        form = AddItemForm(request.POST)
        if form.is_valid():
            item_type = form.cleaned_data['item_type']
            if item_type == 'expense':
                Expense.objects.create(
                    title=form.cleaned_data['title'],
                    amount=form.cleaned_data['amount'],
                    category=form.cleaned_data['category'],
                    date=form.cleaned_data['date'],
                    description=form.cleaned_data['description']
                )
            elif item_type == 'subscription':
                Subscription.objects.create(
                    name=form.cleaned_data['name'],
                    amount=form.cleaned_data['amount'],
                    billing_day=form.cleaned_data['billing_day'],
                    active=form.cleaned_data['active']
                )
            return redirect('home')
    else:
        form = AddItemForm()
    
    return render(request, 'myapp/add_item.html', {'form': form})

