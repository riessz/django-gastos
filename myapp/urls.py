from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('add/', views.add_item, name='add_item'),
    path('expenses/', views.expenses_list, name='expenses_list'),
    path('expenses/<int:exp_id>/edit/', views.expense_edit, name='expense_edit'),
    path('expenses/<int:exp_id>/delete/', views.expense_delete, name='expense_delete'),
    path('subscriptions/', views.subscriptions_list, name='subscriptions_list'),
    path('subscriptions/<int:sub_id>/edit/', views.subscription_edit, name='subscription_edit'),
    path('subscriptions/<int:sub_id>/delete/', views.subscription_delete, name='subscription_delete'),
    path('subscriptions/<int:sub_id>/toggle-payment/', views.toggle_subscription_payment, name='toggle_subscription_payment'),
    path('categories/', views.categories_list, name='categories_list'),
    path('categories/<int:pk>/edit/', views.category_edit, name='category_edit'),
    path('categories/<int:pk>/delete/', views.category_delete, name='category_delete'),
    path('categories/create/', views.category_create_ajax, name='category_create_ajax'),
]