from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('add/', views.add_item, name='add_item'),
    path('expenses/', views.expenses_list, name='expenses_list'),
    path('subscriptions/', views.subscriptions_list, name='subscriptions_list'),
]