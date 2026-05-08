import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="bg-gray-900 rounded-2xl p-4 flex items-center gap-3 group relative">
      <button
        onClick={() => onEdit(sub)}
        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 text-xs tracking-widest"
      >
        ···
      </button>

      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${sub.active ? 'bg-emerald-900/40' : 'bg-gray-800'}`}>
        🔄
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{sub.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Cobra todo dia <span className="font-semibold text-gray-400">{sub.billing_day}</span>
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold tabular-nums ${sub.active ? 'text-emerald-400' : 'text-gray-500'}`}>
          {formatBRL(sub.amount)}
        </p>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold mt-1 ${sub.active ? 'bg-emerald-900/40 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
          {sub.active ? '● Ativa' : '○ Inativa'}
        </span>
      </div>

      <div className="flex-shrink-0 pl-3 border-l border-gray-800">
        <button
          onClick={() => onToggle(sub.id)}
          disabled={isToggling}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 disabled:opacity-60 ${
            sub.paid_this_month
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'bg-amber-900/30 text-amber-400 border border-amber-800/50'
          }`}
        >
          {sub.paid_this_month ? '✓ Paga' : '⏱ Pendente'}
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

  const inputCls =
    'w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-600'
  const labelCls =
    'block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto p-4">

        {/* Header */}
        <div className="py-4 mb-2">
          <div className="flex items-center gap-3 mb-4">
            <Link
              to="/"
              className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors text-lg flex-shrink-0"
            >←</Link>
            <h1 className="text-lg font-bold">Assinaturas</h1>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Ativo Mensal</p>
                <p className="text-3xl font-bold tabular-nums">{formatBRL(total)}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400/70 uppercase tracking-widest mt-1 capitalize">
                {currentMonth}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-emerald-500 animate-spin" />
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
            <div className="bg-gray-900 rounded-2xl p-4 mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-medium text-gray-400">
                  {subscriptions.length} assinatura{subscriptions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-sm font-bold tabular-nums">Total: {formatBRL(total)}/mês</span>
            </div>
          </>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-14 text-center">
            <div className="text-5xl mb-4">🔄</div>
            <p className="text-gray-400 font-semibold">Nenhuma assinatura registrada</p>
            <p className="text-gray-600 text-sm mt-1">Toque em + para adicionar</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-7 right-6 w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all duration-200 z-40"
      >+</button>

      {/* Add / Edit bottom sheet */}
      <BottomSheet
        isOpen={isAdd || isEdit}
        onClose={closeModal}
        title={isAdd ? 'Nova Assinatura' : 'Editar Assinatura'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Nome</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputCls}
              placeholder="Ex: Netflix"
            />
          </div>

          <div>
            <label className={labelCls}>Valor</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className={inputCls}
              placeholder="0,00"
            />
          </div>

          <div>
            <label className={labelCls}>Dia de cobrança</label>
            <input
              type="number"
              required
              min="1"
              max="31"
              value={form.billing_day}
              onChange={(e) => setForm((f) => ({ ...f, billing_day: e.target.value }))}
              className={inputCls}
              placeholder="1 – 31"
            />
          </div>

          <div
            className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3 cursor-pointer select-none"
            onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${form.active ? 'bg-emerald-500' : 'bg-gray-700 border border-gray-600'}`}>
              {form.active && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <span className="text-sm font-medium text-gray-300">Ativa</span>
          </div>

          {formError && (
            <p className="text-rose-400 text-sm text-center -mb-1">{formError}</p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-2xl text-sm active:scale-95 transition-all disabled:opacity-60"
          >
            {isSaving ? 'Salvando...' : 'Salvar Assinatura'}
          </button>

          {isEdit && (
            <div>
              {!showDelete ? (
                <button
                  type="button"
                  onClick={() => setShowDelete(true)}
                  className="w-full py-3 rounded-2xl border border-rose-800/60 text-rose-400 font-semibold text-sm hover:bg-rose-900/20 transition-colors"
                >
                  Excluir Assinatura
                </button>
              ) : (
                <div className="bg-rose-900/20 rounded-2xl p-4 border border-rose-800/50">
                  <p className="text-sm font-semibold text-rose-300 text-center mb-3">
                    Tem certeza? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDelete(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-sm hover:bg-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={deleteMut.isPending}
                      onClick={() => deleteMut.mutate(modal.sub.id)}
                      className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-60"
                    >
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
