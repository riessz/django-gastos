from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .forms import AddItemForm, CategoryForm, ExpenseForm, SubscriptionForm
from .models import Category, Expense, Subscription, SubscriptionPayment


MESES_PT   = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
MESES_ABBR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']


def _month_nav(month, year):
    hoje = timezone.now()
    prev_m = month - 1 if month > 1 else 12
    prev_y = year  if month > 1 else year - 1
    next_m = month + 1 if month < 12 else 1
    next_y = year  if month < 12 else year + 1
    return {
        'selected_month':       month,
        'selected_year':        year,
        'selected_month_label': f"{MESES_PT[month]} {year}",
        'is_current_month':     month == hoje.month and year == hoje.year,
        'prev_month': prev_m, 'prev_year': prev_y,
        'next_month': next_m, 'next_year': next_y,
    }


def _build_trend_data(n=6):
    try:
        import pandas as pd
    except ImportError:
        return []

    hoje = timezone.now()
    result = []
    for i in range(n - 1, -1, -1):
        m = hoje.month - i
        y = hoje.year
        while m <= 0:
            m += 12
            y -= 1
        qs = Expense.objects.filter(date__year=y, date__month=m)
        if qs.exists():
            df = pd.DataFrame(list(qs.values('amount')))
            df['amount'] = pd.to_numeric(df['amount'])
            total = round(float(df['amount'].sum()), 2)
        else:
            total = 0.0
        result.append({'mes': f"{MESES_ABBR[m-1]}/{str(y)[2:]}", 'total': total,
                       'month': m, 'year': y})
    return result


def _build_chart_legend(month_expenses):
    try:
        import pandas as pd
    except ImportError:
        return []

    if not month_expenses:
        return []

    df = pd.DataFrame([
        {'categoria': e.category.name, 'valor': float(e.amount)}
        for e in month_expenses
    ])
    totais = df.groupby('categoria')['valor'].sum().sort_values(ascending=False)

    palette = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#0ea5e9',
               '#f97316', '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16']
    total = float(totais.sum())

    return [
        {
            'categoria': cat,
            'valor': round(float(val), 2),
            'cor': palette[i % len(palette)],
            'pct': round(float(val) / total * 100),
        }
        for i, (cat, val) in enumerate(totais.items())
    ]

@login_required
def home(request):
    hoje = timezone.now()
    month = int(request.GET.get('month', hoje.month))
    year  = int(request.GET.get('year',  hoje.year))

    subscriptions = Subscription.objects.filter(active=True)
    month_expenses = Expense.objects.filter(
        date__year=year, date__month=month
    ).select_related('category')

    expenses         = month_expenses.order_by('-date')[:4]
    total_expense    = sum(e.amount for e in month_expenses)
    total_subscription = sum(s.amount for s in subscriptions)
    chart_legend     = _build_chart_legend(month_expenses)
    trend_data       = _build_trend_data(6)

    context = {
        'current_date': timezone.now(),
        'expenses': expenses,
        'subscriptions': subscriptions,
        'total_expense': total_expense,
        'total_subscription': total_subscription,
        'chart_legend': chart_legend,
        'trend_data': trend_data,
        **_month_nav(month, year),
    }
    return render(request, 'myapp/home.html', context)

@login_required
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

@login_required
def expenses_list(request):
    hoje = timezone.now()
    month = int(request.GET.get('month', hoje.month))
    year  = int(request.GET.get('year',  hoje.year))

    if request.method == 'POST':
        form = ExpenseForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect(f"{reverse('expenses_list')}?month={month}&year={year}")
    else:
        form = ExpenseForm()

    expenses   = Expense.objects.filter(date__year=year, date__month=month).order_by('-date')
    categories = Category.objects.all()
    total      = sum(e.amount for e in expenses)
    return render(request, 'myapp/expenses.html', {
        'expenses': expenses,
        'categories': categories,
        'total': total,
        'form': form,
        'show_modal': request.method == 'POST' and not form.is_valid(),
        **_month_nav(month, year),
    })


@login_required
def expense_edit(request, exp_id):
    if request.method == 'POST':
        exp = get_object_or_404(Expense, pk=exp_id)
        form = ExpenseForm(request.POST, instance=exp)
        if form.is_valid():
            form.save()
            return JsonResponse({'ok': True})
        return JsonResponse({'ok': False, 'error': 'Dados inválidos'}, status=400)
    return JsonResponse({'error': 'Método não permitido'}, status=405)


@login_required
def expense_delete(request, exp_id):
    if request.method == 'POST':
        get_object_or_404(Expense, pk=exp_id).delete()
        return JsonResponse({'ok': True})
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@login_required
def subscriptions_list(request):
    if request.method == 'POST':
        form = SubscriptionForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('subscriptions_list')
    else:
        form = SubscriptionForm()

    hoje = timezone.now()
    subscriptions = Subscription.objects.all()
    for sub in subscriptions:
        payment, _ = SubscriptionPayment.objects.get_or_create(
            subscription=sub, month=hoje.month, year=hoje.year
        )
        sub.paid_this_month = payment.paid

    total = sum(s.amount for s in subscriptions if s.active)
    return render(request, 'myapp/subscriptions.html', {
        'subscriptions': subscriptions,
        'total': total,
        'form': form,
        'show_modal': request.method == 'POST',
        'current_month': hoje.strftime('%B %Y'),
    })


@login_required
def subscription_edit(request, sub_id):
    if request.method == 'POST':
        sub = get_object_or_404(Subscription, pk=sub_id)
        form = SubscriptionForm(request.POST, instance=sub)
        if form.is_valid():
            form.save()
            return JsonResponse({'ok': True})
        return JsonResponse({'ok': False, 'error': 'Dados inválidos'}, status=400)
    return JsonResponse({'error': 'Método não permitido'}, status=405)


@login_required
def subscription_delete(request, sub_id):
    if request.method == 'POST':
        get_object_or_404(Subscription, pk=sub_id).delete()
        return JsonResponse({'ok': True})
    return JsonResponse({'error': 'Método não permitido'}, status=405)


@login_required
def toggle_subscription_payment(request, sub_id):
    if request.method == 'POST':
        hoje = timezone.now()
        sub = get_object_or_404(Subscription, pk=sub_id)
        payment, created = SubscriptionPayment.objects.get_or_create(
            subscription=sub, month=hoje.month, year=hoje.year
        )
        if not created:
            payment.paid = not payment.paid
            payment.save()
        return JsonResponse({'paid': payment.paid})
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@login_required
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
        'show_modal': request.method == 'POST',
    })

@login_required
def category_edit(request, pk):
    category = get_object_or_404(Category, pk=pk)
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        if name:
            category.name = name
            category.save()
    return redirect('categories_list')

@login_required
def category_delete(request, pk):
    if request.method == 'POST':
        get_object_or_404(Category, pk=pk).delete()
    return redirect('categories_list')

@login_required
def category_create_ajax(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        if name:
            category = Category.objects.create(name=name)
            return JsonResponse({'id': category.pk, 'name': category.name})
        return JsonResponse({'error': 'Nome inválido'}, status=400)
    return JsonResponse({'error': 'Método não permitido'}, status=405)

