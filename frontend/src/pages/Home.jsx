import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { apiFetch } from '../api/client'
import MonthNav from '../components/layout/MonthNav'
import DonutChart from '../components/charts/DonutChart'
import TrendChart from '../components/charts/TrendChart'

function formatBRL(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-emerald-500 animate-spin" />
    </div>
  )
}

export default function Home() {
  const { user, logout } = useAuth()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const today = now.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', month, year],
    queryFn: () => apiFetch(`/api/dashboard/?month=${month}&year=${year}`),
  })

  function handleMonthChange(m, y) {
    setMonth(m)
    setYear(y)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto p-4">

        {/* Header */}
        <div className="flex items-start justify-between py-4 mb-2">
          <div>
            <h1 className="text-xl font-bold">Olá, {user?.username} 👋</h1>
            <p className="text-gray-400 text-sm mt-0.5 capitalize">{today}</p>
          </div>
          <nav className="flex items-center gap-3 text-sm flex-wrap justify-end pt-1">
            <Link to="/expenses" className="text-gray-400 hover:text-white transition-colors">Despesas</Link>
            <Link to="/subscriptions" className="text-gray-400 hover:text-white transition-colors">Assinaturas</Link>
            <Link to="/categories" className="text-gray-400 hover:text-white transition-colors">Categorias</Link>
            <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">Sair</button>
          </nav>
        </div>

        {/* Month navigation */}
        <MonthNav month={month} year={year} onChange={handleMonthChange} />

        {isLoading ? <Spinner /> : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-900 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Gastos do mês</p>
                <p className="text-xl font-bold">{formatBRL(data?.total_expense ?? 0)}</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Assinaturas ativas</p>
                <p className="text-xl font-bold">{formatBRL(data?.total_subscription ?? 0)}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <DonutChart data={data?.chart_legend} total={data?.total_expense ?? 0} />
              <TrendChart data={data?.trend_data} />
            </div>

            {/* Lists */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900 rounded-2xl p-4">
                <p className="text-sm font-medium text-gray-300 mb-3">Gastos recentes</p>
                {data?.recent_expenses?.length > 0 ? (
                  <ul className="space-y-3">
                    {data.recent_expenses.map((e) => (
                      <li key={e.id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{e.title}</p>
                          <p className="text-xs text-gray-500">{e.category_name}</p>
                        </div>
                        <span className="text-sm font-medium text-emerald-400 flex-shrink-0">
                          {formatBRL(e.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">Nenhum gasto neste mês</p>
                )}
              </div>

              <div className="bg-gray-900 rounded-2xl p-4">
                <p className="text-sm font-medium text-gray-300 mb-3">Assinaturas ativas</p>
                {data?.active_subscriptions?.length > 0 ? (
                  <ul className="space-y-3">
                    {data.active_subscriptions.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-2">
                        <p className="text-sm text-white truncate">{s.name}</p>
                        <span className="text-sm font-medium text-gray-300 flex-shrink-0">
                          {formatBRL(s.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">Nenhuma assinatura ativa</p>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
