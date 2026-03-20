from django import forms
from .models import Category, Expense, Subscription

class AddItemForm(forms.Form):
    ITEM_TYPE_CHOICES = [
        ('expense', 'Despesa'),
        ('subscription', 'Inscrição'),
    ]
    
    item_type = forms.ChoiceField(
        choices=ITEM_TYPE_CHOICES,
        widget=forms.RadioSelect,
        label="Tipo de Item"
    )
    
    # Fields for Expense
    title = forms.CharField(max_length=200, required=False, label="Título da Despesa")
    amount = forms.DecimalField(max_digits=10, decimal_places=2, required=False, label="Valor")
    category = forms.ModelChoiceField(queryset=Category.objects.all(), required=False, label="Categoria")
    date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}), label="Data")
    description = forms.CharField(widget=forms.Textarea, required=False, label="Descrição")
    
    # Fields for Subscription
    name = forms.CharField(max_length=200, required=False, label="Nome da Inscrição")
    billing_day = forms.IntegerField(min_value=1, max_value=31, required=False, label="Dia de Cobrança")
    active = forms.BooleanField(required=False, initial=True, label="Ativa")

    def clean(self):
        cleaned_data = super().clean()
        item_type = cleaned_data.get('item_type')
        
        if item_type == 'expense':
            required_fields = ['title', 'amount', 'category', 'date']
            for field in required_fields:
                if not cleaned_data.get(field):
                    self.add_error(field, f'Este campo é obrigatório para despesas.')
        elif item_type == 'subscription':
            required_fields = ['name', 'amount', 'billing_day']
            for field in required_fields:
                if not cleaned_data.get(field):
                    self.add_error(field, f'Este campo é obrigatório para inscrições.')
        
        return cleaned_data