import { useState } from 'react'
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
      <div className="w-7 h-7 rounded-full border-2 border-white/[0.08] border-t-violet-500 animate-spin" />
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

  return (
    <div className="min-h-screen bg-[#070710] text-[#ededf5]">
      {/* Ambient glow */}
      <div className="fixed top-0 left-0 right-0 h-64 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[280px] bg-violet-700/[0.06] rounded-full blur-[80px]" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-28 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between pt-6 pb-5">
          <div>
            <h1 className="text-xl font-syne font-bold text-white leading-tight">
              Olá, {user?.username}
            </h1>
            <p className="text-sm text-[#8080a0] mt-0.5 capitalize">{today}</p>
          </div>
          <button
            onClick={logout}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[#50507a] hover:text-[#ededf5] hover:bg-white/[0.08] transition-all"
            title="Sair"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        {/* Month navigation */}
        <MonthNav month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />

        {isLoading ? <Spinner /> : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-rose-500/[0.1] via-transparent to-transparent border border-rose-500/[0.18] rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                  <p className="text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.1em]">Gastos do mês</p>
                </div>
                <p className="text-[22px] font-mono-fin font-medium text-white leading-none">
                  {formatBRL(data?.total_expense ?? 0)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/[0.09] via-transparent to-transparent border border-emerald-500/[0.15] rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <p className="text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.1em]">Assinaturas</p>
                </div>
                <p className="text-[22px] font-mono-fin font-medium text-white leading-none">
                  {formatBRL(data?.total_subscription ?? 0)}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <DonutChart data={data?.chart_legend} total={data?.total_expense ?? 0} />
              <TrendChart data={data?.trend_data} />
            </div>

            {/* Lists */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                <p className="text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.1em] mb-3">
                  Gastos recentes
                </p>
                {data?.recent_expenses?.length > 0 ? (
                  <ul className="space-y-3">
                    {data.recent_expenses.map((e) => (
                      <li key={e.id} className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm text-[#ededf5] truncate leading-tight">{e.title}</p>
                          <p className="text-[11px] text-[#606080] mt-0.5">{e.category_name}</p>
                        </div>
                        <span className="text-[11px] font-mono-fin text-rose-400 flex-shrink-0 mt-0.5">
                          {formatBRL(e.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#44445a]">Nenhum gasto</p>
                )}
              </div>

              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                <p className="text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.1em] mb-3">
                  Assinaturas ativas
                </p>
                {data?.active_subscriptions?.length > 0 ? (
                  <ul className="space-y-3">
                    {data.active_subscriptions.map((s) => (
                      <li key={s.id} className="flex items-start justify-between gap-2">
                        <p className="text-sm text-[#ededf5] truncate leading-tight">{s.name}</p>
                        <span className="text-[11px] font-mono-fin text-emerald-400 flex-shrink-0 mt-0.5">
                          {formatBRL(s.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#44445a]">Nenhuma ativa</p>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
