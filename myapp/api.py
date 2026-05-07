from django.contrib.auth import authenticate, login, logout
from django.db.models import Sum
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from myapp.models import Expense, Category, Subscription
from myapp.serializers import ExpenseSerializer, CategorySerializer, SubscriptionSerializer

MESES_PT   = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
MESES_ABBR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']


def _build_trend_data(n=6):
    hoje = timezone.now()
    result = []
    for i in range(n - 1, -1, -1):
        m = hoje.month - i
        y = hoje.year
        while m <= 0:
            m += 12
            y -= 1
        total = float(
            Expense.objects.filter(date__year=y, date__month=m)
            .aggregate(t=Sum('amount'))['t'] or 0
        )
        result.append({'mes': f"{MESES_ABBR[m-1]}/{str(y)[2:]}", 'total': round(total, 2), 'month': m, 'year': y})
    return result


def _build_chart_legend(month_expenses):
    if not month_expenses:
        return []

    palette = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#0ea5e9',
               '#f97316', '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16']

    totals = {}
    for e in month_expenses:
        cat = e.category.name
        totals[cat] = totals.get(cat, 0.0) + float(e.amount)

    total_sum = sum(totals.values())
    if total_sum == 0:
        return []

    return [
        {
            'categoria': cat,
            'valor': round(val, 2),
            'cor': palette[i % len(palette)],
            'pct': round(val / total_sum * 100),
        }
        for i, (cat, val) in enumerate(sorted(totals.items(), key=lambda x: x[1], reverse=True))
    ]


# ── Auth endpoints ────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def api_csrf(request):
    return Response({'ok': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username', '')
    password = request.data.get('password', '')
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
    login(request, user)
    return Response({'id': user.id, 'username': user.username})


@api_view(['POST'])
def api_logout(request):
    logout(request)
    return Response({'ok': True})


@api_view(['GET'])
def api_me(request):
    return Response({'id': request.user.id, 'username': request.user.username})


# ── Dashboard ────────────────────────────────────────────────────────────────

@api_view(['GET'])
def api_dashboard(request):
    hoje = timezone.now()
    month = int(request.GET.get('month', hoje.month))
    year  = int(request.GET.get('year',  hoje.year))

    subscriptions  = list(Subscription.objects.filter(active=True))
    month_expenses = list(
        Expense.objects.filter(date__year=year, date__month=month).select_related('category')
    )

    recent = sorted(month_expenses, key=lambda e: e.date, reverse=True)[:4]

    return Response({
        'month':       month,
        'year':        year,
        'month_label': f"{MESES_PT[month]} {year}",
        'total_expense':      float(sum(e.amount for e in month_expenses)),
        'total_subscription': float(sum(s.amount for s in subscriptions)),
        'chart_legend':  _build_chart_legend(month_expenses),
        'trend_data':    _build_trend_data(6),
        'recent_expenses': [
            {
                'id': e.id, 'title': e.title,
                'amount': float(e.amount),
                'category_name': e.category.name,
                'date': e.date.isoformat(),
            }
            for e in recent
        ],
        'active_subscriptions': [
            {'id': s.id, 'name': s.name, 'amount': float(s.amount), 'billing_day': s.billing_day}
            for s in subscriptions
        ],
    })


# ── ViewSets ──────────────────────────────────────────────────────────────────

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]


