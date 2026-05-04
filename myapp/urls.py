from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('add/', views.add_item, name='add_item'),
    path('expenses/', views.expenses_list, name='expenses_list'),
    path('subscriptions/', views.subscriptions_list, name='subscriptions_list'),
    path('categories/', views.categories_list, name='categories_list'),
    path('categories/<int:pk>/edit/', views.category_edit, name='category_edit'),
    path('categories/<int:pk>/delete/', views.category_delete, name='category_delete'),
    path('categories/create/', views.category_create_ajax, name='category_create_ajax'),
]