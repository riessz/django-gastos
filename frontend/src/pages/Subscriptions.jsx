import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import BottomSheet from '../components/modals/BottomSheet'
import {
  listSubscriptions, createSubscription, updateSubscription,
  deleteSubscription, togglePayment,
} from '../api/subscriptions'

function formatBRL(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const EMPTY_FORM = { name: '', amount: '', billing_day: '', active: true }

function SubCard({ sub, onEdit, onToggle, isToggling }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex items-center gap-3 group relative">
      <button
        onClick={() => onEdit(sub)}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#8080a0] hover:text-[#ededf5] text-xs"
      >
        ···
      </button>

      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sub.active ? 'bg-emerald-500/[0.12]' : 'bg-white/[0.04]'}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sub.active ? '#10b981' : '#50507a'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1.02 6.63 2.68" />
          <path d="M21 3v6h-6" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#ededf5]">{sub.name}</p>
        <p className="text-[11px] text-[#606080] mt-0.5">
          Dia <span className="font-semibold text-[#8080a0]">{sub.billing_day}</span> de cada mês
        </p>
      </div>

      <div className="text-right flex-shrink-0 mr-2">
        <p className={`text-sm font-mono-fin font-medium ${sub.active ? 'text-emerald-400' : 'text-[#50507a]'}`}>
          {formatBRL(sub.amount)}
        </p>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-syne font-semibold mt-1 ${sub.active ? 'bg-emerald-500/[0.1] text-emerald-400' : 'bg-white/[0.04] text-[#50507a]'}`}>
          {sub.active ? '● Ativa' : '○ Inativa'}
        </span>
      </div>

      <div className="flex-shrink-0 pl-3 border-l border-white/[0.06]">
        <button
          onClick={() => onToggle(sub.id)}
          disabled={isToggling}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-syne font-semibold transition-all active:scale-95 disabled:opacity-60 ${
            sub.paid_this_month
              ? 'bg-emerald-500/[0.15] text-emerald-400 border border-emerald-500/[0.2]'
              : 'bg-amber-500/[0.1] text-amber-400 border border-amber-500/[0.2]'
          }`}
        >
          {sub.paid_this_month ? '✓ Pago' : '⏱ Pend.'}
        </button>
      </div>
    </div>
  )
}

export default function Subscriptions() {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showDelete, setShowDelete] = useState(false)
  const [formError, setFormError] = useState('')
  const queryClient = useQueryClient()

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: listSubscriptions,
  })

  const total = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + parseFloat(s.amount), 0)

  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const createMut = useMutation({
    mutationFn: createSubscription,
    onSuccess: () => { invalidate(); closeModal() },
    onError: () => setFormError('Erro ao salvar. Tente novamente.'),
  })
  const updateMut = useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => { invalidate(); closeModal() },
    onError: () => setFormError('Erro ao salvar. Tente novamente.'),
  })
  const deleteMut = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => { invalidate(); closeModal() },
    onError: () => setFormError('Erro ao excluir. Tente novamente.'),
  })
  const toggleMut = useMutation({
    mutationFn: togglePayment,
    onMutate: async (subId) => {
      await queryClient.cancelQueries({ queryKey: ['subscriptions'] })
      const prev = queryClient.getQueryData(['subscriptions'])
      queryClient.setQueryData(['subscriptions'], (old) =>
        old?.map((s) => s.id === subId ? { ...s, paid_this_month: !s.paid_this_month } : s)
      )
      return { prev }
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(['subscriptions'], ctx.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  })

  function openAdd() {
    setForm(EMPTY_FORM)
    setShowDelete(false)
    setModal('add')
  }

  function openEdit(sub) {
    setForm({
      name: sub.name,
      amount: String(sub.amount),
      billing_day: String(sub.billing_day),
      active: sub.active,
    })
    setShowDelete(false)
    setModal({ type: 'edit', sub })
  }

  function closeModal() {
    setModal(null)
    setShowDelete(false)
    setFormError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const data = {
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      billing_day: parseInt(form.billing_day),
      active: form.active,
    }
    if (modal === 'add') createMut.mutate(data)
    else updateMut.mutate({ id: modal.sub.id, ...data })
  }

  const isAdd = modal === 'add'
  const isEdit = modal?.type === 'edit'
  const isSaving = createMut.isPending || updateMut.isPending

  const inputCls = 'w-full bg-white/[0.06] border border-white/[0.09] text-[#ededf5] rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all placeholder-[#3a3a5a]'
  const labelCls = 'block text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.1em] mb-2'

  return (
    <div className="min-h-screen bg-[#070710] text-[#ededf5]">
      <div className="max-w-2xl mx-auto px-4 pb-28">

        {/* Header */}
        <div className="pt-6 pb-4 mb-2">
          <h1 className="text-xl font-syne font-bold text-white mb-4">Assinaturas</h1>
          <div className="bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-transparent border border-emerald-500/[0.13] rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.1em] mb-1">Total Ativo Mensal</p>
                <p className="text-3xl font-mono-fin font-medium text-white">{formatBRL(total)}</p>
              </div>
              <span className="text-[10px] font-syne font-semibold text-emerald-400/60 uppercase tracking-widest mt-1 capitalize">
                {currentMonth}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-white/[0.08] border-t-violet-500 animate-spin" />
          </div>
        ) : subscriptions.length > 0 ? (
          <>
            <div className="space-y-2.5">
              {subscriptions.map((sub) => (
                <SubCard
                  key={sub.id}
                  sub={sub}
                  onEdit={openEdit}
                  onToggle={(id) => toggleMut.mutate(id)}
                  isToggling={toggleMut.isPending}
                />
              ))}
            </div>
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-sm text-[#8080a0]">
                  {subscriptions.length} assinatura{subscriptions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-sm font-mono-fin font-medium text-[#ededf5]">{formatBRL(total)}/mês</span>
            </div>
          </>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/[0.1] border border-emerald-500/[0.15] flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1.02 6.63 2.68" />
                <path d="M21 3v6h-6" />
              </svg>
            </div>
            <p className="text-[#8080a0] font-syne font-semibold">Nenhuma assinatura registrada</p>
            <p className="text-[#44445a] text-sm mt-1">Toque em + para adicionar</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-[92px] right-6 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-[0_4px_24px_rgba(16,185,129,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-40"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Add / Edit bottom sheet */}
      <BottomSheet isOpen={isAdd || isEdit} onClose={closeModal} title={isAdd ? 'Nova Assinatura' : 'Editar Assinatura'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Nome</label>
            <input type="text" required value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputCls} placeholder="Ex: Netflix" />
          </div>

          <div>
            <label className={labelCls}>Valor</label>
            <input type="number" required min="0.01" step="0.01" value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className={inputCls} placeholder="0,00" />
          </div>

          <div>
            <label className={labelCls}>Dia de cobrança</label>
            <input type="number" required min="1" max="31" value={form.billing_day}
              onChange={(e) => setForm((f) => ({ ...f, billing_day: e.target.value }))}
              className={inputCls} placeholder="1 – 31" />
          </div>

          <div
            className="flex items-center gap-3 bg-white/[0.06] border border-white/[0.09] rounded-xl px-4 py-3 cursor-pointer select-none hover:bg-white/[0.08] transition-all"
            onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${form.active ? 'bg-emerald-500' : 'bg-white/[0.08] border border-white/[0.12]'}`}>
              {form.active && <span className="text-white text-xs font-bold leading-none">✓</span>}
            </div>
            <span className="text-sm text-[#ededf5]">Ativa</span>
          </div>

          {formError && (
            <p className="text-rose-400 text-sm text-center -mb-1">{formError}</p>
          )}

          <button type="submit" disabled={isSaving}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-syne font-semibold rounded-2xl text-sm active:scale-95 transition-all disabled:opacity-50 shadow-[0_4px_20px_rgba(16,185,129,0.3)]">
            {isSaving ? 'Salvando...' : 'Salvar Assinatura'}
          </button>

          {isEdit && (
            <div>
              {!showDelete ? (
                <button type="button" onClick={() => setShowDelete(true)}
                  className="w-full py-3 rounded-2xl border border-rose-500/[0.2] text-rose-400/80 font-syne font-semibold text-sm hover:bg-rose-500/[0.06] transition-all">
                  Excluir Assinatura
                </button>
              ) : (
                <div className="bg-rose-500/[0.06] rounded-2xl p-4 border border-rose-500/[0.15]">
                  <p className="text-sm font-syne font-semibold text-rose-400/80 text-center mb-3">
                    Tem certeza? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowDelete(false)}
                      className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-[#a0a0c0] font-syne font-semibold text-sm hover:bg-white/[0.05] transition-all">
                      Cancelar
                    </button>
                    <button type="button" disabled={deleteMut.isPending}
                      onClick={() => deleteMut.mutate(modal.sub.id)}
                      className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-syne font-semibold text-sm active:scale-95 transition-all disabled:opacity-60">
                      {deleteMut.isPending ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </BottomSheet>
    </div>
  )
}
