from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.utils import timezone
from datetime import datetime
from .forms import AddItemForm, CategoryForm, ExpenseForm, SubscriptionForm
from .models import Category, Expense, Subscription

def home(request):
    hoje = timezone.now()
    expenses = Expense.objects.order_by('-date')[:10]
    subscriptions = Subscription.objects.filter(active=True)

    total_expense = sum(
        e.amount for e in Expense.objects.filter(date__year=hoje.year, date__month=hoje.month)
    )
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

def expenses_list(request):
    if request.method == 'POST':
        form = ExpenseForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('expenses_list')
    else:
        form = ExpenseForm()

    expenses = Expense.objects.order_by('-date')
    total = sum(e.amount for e in expenses)
    return render(request, 'myapp/expenses.html', {
        'expenses': expenses,
        'total': total,
        'form': form,
        'show_modal': request.method == 'POST',
    })

def subscriptions_list(request):
    if request.method == 'POST':
        form = SubscriptionForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('subscriptions_list')
    else:
        form = SubscriptionForm()

    subscriptions = Subscription.objects.all()
    total = sum(s.amount for s in subscriptions if s.active)
    return render(request, 'myapp/subscriptions.html', {
        'subscriptions': subscriptions,
        'total': total,
        'form': form,
        'show_modal': request.method == 'POST',
    })

def categories_list(request):
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('categories_list')
    else:
        form = CategoryForm()

    categories = Category.objects.all()
    return render(request, 'myapp/categories.html', {
        'categories': categories,
        'form': form,
        'show_modal': request.method == 'POST' and not CategoryForm(request.POST).is_valid(),
    })

def category_edit(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        if name:
            category.name = name
            category.save()
    return redirect('categories_list')

def category_delete(request, pk):
    if request.method == 'POST':
        get_object_or_404(Category, pk=pk).delete()
    return redirect('categories_list')

def category_create_ajax(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        if name:
            category = Category.objects.create(name=name)
            return JsonResponse({'id': category.pk, 'name': category.name})
        return JsonResponse({'error': 'Nome inválido'}, status=400)
    return JsonResponse({'error': 'Método não permitido'}, status=405)

