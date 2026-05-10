import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MonthNav from '../components/layout/MonthNav'
import BottomSheet from '../components/modals/BottomSheet'
import { listExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenses'
import { listCategories, createCategory } from '../api/categories'

function formatBRL(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

const EMPTY_FORM = { title: '', amount: '', category: '', date: todayISO(), description: '' }

function CatModal({ onClose, onSave, isPending }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs bg-[#0d0d22] border border-white/[0.1] rounded-2xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-syne font-bold text-[#ededf5]">Nova Categoria</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] flex items-center justify-center text-[#8080a0] hover:text-[#ededf5] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()) }}
          className="w-full bg-white/[0.06] border border-white/[0.09] text-[#ededf5] rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/50 placeholder-[#3a3a5a] mb-3 transition-all"
          placeholder="Nome da categoria"
        />
        <button
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={isPending || !name.trim()}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-syne font-semibold rounded-xl text-sm active:scale-95 transition-all disabled:opacity-50 shadow-[0_4px_16px_rgba(124,58,237,0.3)]"
        >
          {isPending ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}

function ExpenseRow({ expense, onClick }) {
  return (
    <div
      onClick={() => onClick(expense)}
      className="grid grid-cols-12 gap-2 px-4 py-3.5 hover:bg-white/[0.03] transition-colors items-center group cursor-pointer border-b border-white/[0.05] last:border-b-0"
    >
      <p className="col-span-4 text-sm font-medium text-[#ededf5] truncate pr-2">{expense.title}</p>
      <div className="col-span-3">
        <span className="inline-flex px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[#a0a0c0] text-[10px] truncate max-w-full">
          {expense.category_name}
        </span>
      </div>
      <p className="col-span-2 text-[11px] text-[#8080a0] font-mono-fin">{formatDate(expense.date)}</p>
      <p className="col-span-2 text-sm font-mono-fin font-medium text-rose-400 text-right">
        {formatBRL(expense.amount)}
      </p>
      <div className="col-span-1 flex justify-end">
        <span className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#8080a0] text-xs leading-none">
          ···
        </span>
      </div>
    </div>
  )
}

export default function Expenses() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showDelete, setShowDelete] = useState(false)
  const [catModal, setCatModal] = useState(false)
  const [formError, setFormError] = useState('')
  const queryClient = useQueryClient()

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', month, year],
    queryFn: () => listExpenses(month, year),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  })

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0)

  const monthLabel = new Date(year, month - 1)
    .toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['expenses', month, year] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const createMut = useMutation({
    mutationFn: createExpense,
    onSuccess: () => { invalidate(); closeModal() },
    onError: () => setFormError('Erro ao salvar. Tente novamente.'),
  })
  const updateMut = useMutation({
    mutationFn: updateExpense,
    onSuccess: () => { invalidate(); closeModal() },
    onError: () => setFormError('Erro ao salvar. Tente novamente.'),
  })
  const deleteMut = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => { invalidate(); closeModal() },
    onError: () => setFormError('Erro ao excluir. Tente novamente.'),
  })
  const createCatMut = useMutation({
    mutationFn: createCategory,
    onSuccess: (cat) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setForm((f) => ({ ...f, category: String(cat.id) }))
      setCatModal(false)
    },
  })

  function openAdd() {
    setForm({ ...EMPTY_FORM, date: todayISO() })
    setShowDelete(false)
    setModal('add')
  }

  function openEdit(expense) {
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: String(expense.category),
      date: expense.date,
      description: expense.description || '',
    })
    setShowDelete(false)
    setModal({ type: 'edit', expense })
  }

  function closeModal() {
    setModal(null)
    setShowDelete(false)
    setFormError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const data = {
      title: form.title.trim(),
      amount: parseFloat(form.amount),
      category: parseInt(form.category),
      date: form.date,
      description: form.description.trim(),
    }
    if (modal === 'add') createMut.mutate(data)
    else updateMut.mutate({ id: modal.expense.id, ...data })
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
          <h1 className="text-xl font-syne font-bold text-white mb-4">Lista de Gastos</h1>
          <div className="bg-gradient-to-br from-rose-500/[0.09] via-transparent to-transparent border border-rose-500/[0.15] rounded-2xl p-4">
            <p className="text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.1em] mb-1 capitalize">
              Total · {monthLabel}
            </p>
            <p className="text-3xl font-mono-fin font-medium text-white">{formatBRL(total)}</p>
          </div>
        </div>

        {/* Month navigation */}
        <MonthNav
          month={month}
          year={year}
          onChange={(m, y) => { setMonth(m); setYear(y) }}
        />

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-white/[0.08] border-t-violet-500 animate-spin" />
          </div>
        ) : expenses.length > 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/[0.06]">
              <span className="col-span-4 text-[10px] font-syne font-bold text-[#50507a] uppercase tracking-wider">Título</span>
              <span className="col-span-3 text-[10px] font-syne font-bold text-[#50507a] uppercase tracking-wider">Categoria</span>
              <span className="col-span-2 text-[10px] font-syne font-bold text-[#50507a] uppercase tracking-wider">Data</span>
              <span className="col-span-2 text-[10px] font-syne font-bold text-[#50507a] uppercase tracking-wider text-right">Valor</span>
              <span className="col-span-1" />
            </div>
            {/* Rows */}
            <div>
              {expenses.map((exp) => (
                <ExpenseRow key={exp.id} expense={exp} onClick={openEdit} />
              ))}
            </div>
            {/* Footer */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-white/[0.06] bg-white/[0.02]">
              <p className="col-span-10 text-[10px] font-syne font-bold text-[#50507a] uppercase tracking-wide">Total</p>
              <p className="col-span-2 text-sm font-mono-fin font-medium text-right text-[#ededf5]">{formatBRL(total)}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/[0.1] border border-rose-500/[0.15] flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" />
              </svg>
            </div>
            <p className="text-[#8080a0] font-syne font-semibold">Nenhum gasto registrado</p>
            <p className="text-[#44445a] text-sm mt-1">Toque em + para adicionar</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-[92px] right-6 w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl shadow-[0_4px_24px_rgba(244,63,94,0.4)] flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all duration-200 z-40"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Add / Edit bottom sheet */}
      <BottomSheet isOpen={isAdd || isEdit} onClose={closeModal} title={isAdd ? 'Novo Gasto' : 'Editar Gasto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Título</label>
            <input type="text" required value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputCls} placeholder="Ex: Almoço" />
          </div>

          <div>
            <label className={labelCls}>Valor</label>
            <input type="number" required min="0.01" step="0.01" value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className={inputCls} placeholder="0,00" />
          </div>

          <div>
            <label className={labelCls}>Categoria</label>
            <div className="flex gap-2">
              <select required value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className={`${inputCls} flex-1`}>
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => setCatModal(true)}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.09] hover:bg-white/[0.1] flex items-center justify-center text-[#8080a0] hover:text-violet-400 text-xl transition-all">
                +
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Data</label>
            <input type="date" required value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>
              Descrição{' '}
              <span className="text-[#44445a] normal-case font-normal">(opcional)</span>
            </label>
            <textarea rows={3} value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={`${inputCls} resize-none`} placeholder="Anotações..." />
          </div>

          {formError && (
            <p className="text-rose-400 text-sm text-center -mb-1">{formError}</p>
          )}

          <button type="submit" disabled={isSaving}
            className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-syne font-semibold rounded-2xl text-sm active:scale-95 transition-all disabled:opacity-50 shadow-[0_4px_20px_rgba(244,63,94,0.3)]">
            {isSaving ? 'Salvando...' : 'Salvar Gasto'}
          </button>

          {isEdit && (
            <div>
              {!showDelete ? (
                <button type="button" onClick={() => setShowDelete(true)}
                  className="w-full py-3 rounded-2xl border border-rose-500/[0.2] text-rose-400/80 font-syne font-semibold text-sm hover:bg-rose-500/[0.06] transition-all">
                  Excluir Gasto
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
                      onClick={() => deleteMut.mutate(modal.expense.id)}
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

      {catModal && (
        <CatModal
          onClose={() => setCatModal(false)}
          onSave={(name) => createCatMut.mutate(name)}
          isPending={createCatMut.isPending}
        />
      )}
    </div>
  )
}
