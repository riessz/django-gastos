# Gestão de Gastos

Aplicação web para controle de gastos domésticos, desenvolvida com Django.

## Funcionalidades

- **Dashboard** — resumo mensal com gráfico de categorias e tendência dos últimos 6 meses
- **Gastos** — cadastro, edição e exclusão de despesas por categoria e data
- **Assinaturas** — gerenciamento de serviços recorrentes com controle de pagamento mensal
- **Categorias** — criação e edição de categorias personalizadas

## Tecnologias

- Python / Django 6
- SQLite
- Pandas + NumPy (gráficos e análises)
- HTML/CSS (templates Django)

## Instalação

```bash
# Clone o repositório
git clone <url-do-repo>
cd Django-gastos

# Crie e ative o ambiente virtual
python -m venv .venv
.venv\Scripts\activate  # Windows

# Instale as dependências
pip install -r requirements.txt

# Execute as migrações
python manage.py migrate

# Inicie o servidor
python manage.py runserver
```

Acesse em `http://localhost:8000`.
