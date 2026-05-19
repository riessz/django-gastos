# Gestão de Gastos

Aplicação web para controle de gastos domésticos. Arquitetura desacoplada: API REST em Django no backend e SPA em React no frontend.

## Funcionalidades

- **Dashboard** — resumo mensal com gráfico de categorias (donut) e tendência dos últimos 6 meses (barras)
- **Gastos** — cadastro, edição e exclusão de despesas por categoria e data
- **Assinaturas** — gerenciamento de serviços recorrentes com controle de pagamento mensal
- **Categorias** — criação e edição de categorias personalizadas

## Tecnologias

**Backend**
- Python / Django 6 + Django REST Framework
- SQLite
- Autenticação por sessão com CSRF

**Frontend**
- React 19 + Vite 8
- Chart.js 4 (gráficos de donut e barras)
- TanStack Query 5 (cache e sincronização de dados)
- React Router 7
- Tailwind CSS 3

## Instalação

### Backend

```bash
git clone <url-do-repo>
cd Django-gastos

python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser   # cria o primeiro usuário

python manage.py runserver
```

API disponível em `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse em `http://localhost:5173`.
