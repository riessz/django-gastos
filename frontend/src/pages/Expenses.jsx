import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xs bg-gray-900 rounded-2xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Nova Categoria</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()) }}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-gray-600 mb-3"
          placeholder="Nome da categoria"
        />
        <button
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={isPending || !name.trim()}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-xl text-sm active:scale-95 transition-all disabled:opacity-60"
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
      className="grid grid-cols-12 gap-2 px-4 py-3.5 hover:bg-gray-800/50 transition-colors items-center group cursor-pointer"
    >
      <p className="col-span-4 text-sm font-semibold truncate pr-2">{expense.title}</p>
      <div className="col-span-3">
        <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-xs font-medium truncate max-w-full">
          {expense.category_name}
        </span>
      </div>
      <p className="col-span-2 text-xs text-gray-400 tabular-nums">{formatDate(expense.date)}</p>
      <p className="col-span-2 text-sm font-bold text-rose-400 text-right tabular-nums">
        {formatBRL(expense.amount)}
      </p>
      <div className="col-span-1 flex justify-end">
        <span className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 text-xs tracking-widest">
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
  const [modal, setModal] = useState(null)   // null | 'add' | { type:'edit', expense }
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

  const isAdd  = modal === 'add'
  const isEdit = modal?.type === 'edit'
  const isSaving = createMut.isPending || updateMut.isPending

  const inputCls =
    'w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-gray-600'
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
            >
              ←
            </Link>
            <h1 className="text-lg font-bold">Lista de Gastos</h1>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 capitalize">
              Total · {monthLabel}
            </p>
            <p className="text-3xl font-bold tabular-nums">{formatBRL(total)}</p>
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
            <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-emerald-500 animate-spin" />
          </div>
        ) : expenses.length > 0 ? (
          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-800">
              <span className="col-span-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Título</span>
              <span className="col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Categoria</span>
              <span className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</span>
              <span className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Valor</span>
              <span className="col-span-1" />
            </div>
            {/* Rows */}
            <div className="divide-y divide-gray-800">
              {expenses.map((exp) => (
                <ExpenseRow key={exp.id} expense={exp} onClick={openEdit} />
              ))}
            </div>
            {/* Footer */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-gray-800 bg-gray-800/30">
              <p className="col-span-10 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</p>
              <p className="col-span-2 text-sm font-bold text-right tabular-nums">{formatBRL(total)}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-14 text-center">
            <div className="text-5xl mb-4">🧾</div>
            <p className="text-gray-400 font-semibold">Nenhum gasto registrado</p>
            <p className="text-gray-600 text-sm mt-1">Toque em + para adicionar</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-7 right-6 w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl shadow-lg shadow-rose-500/30 flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all duration-200 z-40"
      >
        +
      </button>

      {/* Add / Edit bottom sheet */}
      <BottomSheet
        isOpen={isAdd || isEdit}
        onClose={closeModal}
        title={isAdd ? 'Novo Gasto' : 'Editar Gasto'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Título</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputCls}
              placeholder="Ex: Almoço"
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
            <label className={labelCls}>Categoria</label>
            <div className="flex gap-2">
              <select
                required
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className={`${inputCls} flex-1`}
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCatModal(true)}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center text-rose-400 text-xl transition-colors"
                title="Nova categoria"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Data</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Descrição{' '}
              <span className="text-gray-600 normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={`${inputCls} resize-none`}
              placeholder="Anotações..."
            />
          </div>

          {formError && (
            <p className="text-rose-400 text-sm text-center -mb-1">{formError}</p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-2xl text-sm active:scale-95 transition-all disabled:opacity-60"
          >
            {isSaving ? 'Salvando...' : 'Salvar Gasto'}
          </button>

          {/* Delete — only in edit mode */}
          {isEdit && (
            <div>
              {!showDelete ? (
                <button
                  type="button"
                  onClick={() => setShowDelete(true)}
                  className="w-full py-3 rounded-2xl border border-rose-800/60 text-rose-400 font-semibold text-sm hover:bg-rose-900/20 transition-colors"
                >
                  Excluir Gasto
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
                      onClick={() => deleteMut.mutate(modal.expense.id)}
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

      {/* Category mini-modal (above the bottom sheet) */}
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
