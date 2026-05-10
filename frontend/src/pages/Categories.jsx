import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import BottomSheet from '../components/modals/BottomSheet'
import { listCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'

const DOT_COLORS = ['#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6', '#a78bfa']

export default function Categories() {
  const [modal, setModal] = useState(null)
  const [name, setName] = useState('')
  const [delCat, setDelCat] = useState(null)
  const [formError, setFormError] = useState('')
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
  }

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { invalidate(); closeModal() },
    onError: () => setFormError('Erro ao salvar. Tente novamente.'),
  })
  const updateMut = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => { invalidate(); closeModal() },
    onError: () => setFormError('Erro ao salvar. Tente novamente.'),
  })
  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { invalidate(); setDelCat(null) },
    onError: () => setDelCat(null),
  })

  function openAdd() { setName(''); setModal('add') }
  function openEdit(cat) { setName(cat.name); setModal({ type: 'edit', cat }) }
  function closeModal() { setModal(null); setName(''); setFormError('') }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (modal === 'add') createMut.mutate(trimmed)
    else updateMut.mutate({ id: modal.cat.id, name: trimmed })
  }

  const isAdd = modal === 'add'
  const isEdit = modal?.type === 'edit'
  const isSaving = createMut.isPending || updateMut.isPending

  return (
    <div className="min-h-screen bg-[#070710] text-[#ededf5]">
      <div className="max-w-2xl mx-auto px-4 pb-28">

        {/* Header */}
        <div className="pt-6 pb-4 mb-2">
          <h1 className="text-xl font-syne font-bold text-white mb-4">Categorias</h1>
          <div className="bg-gradient-to-br from-violet-500/[0.08] via-transparent to-transparent border border-violet-500/[0.13] rounded-2xl p-4">
            <p className="text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.1em] mb-1">Total de Categorias</p>
            <p className="text-3xl font-mono-fin font-medium text-white">{categories.length}</p>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-white/[0.08] border-t-violet-500 animate-spin" />
          </div>
        ) : categories.length > 0 ? (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <span className="text-[10px] font-syne font-bold text-[#50507a] uppercase tracking-wider">Nome</span>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {categories.map((cat, i) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: DOT_COLORS[i % DOT_COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-[#ededf5]">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center transition-all text-[#606080] hover:text-violet-400 hover:bg-violet-500/[0.08] hover:border-violet-500/[0.2]"
                      title="Editar"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDelCat(cat)}
                      className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center transition-all text-[#606080] hover:text-rose-400 hover:bg-rose-500/[0.08] hover:border-rose-500/[0.15]"
                      title="Excluir"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/[0.1] border border-violet-500/[0.15] flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <p className="text-[#8080a0] font-syne font-semibold">Nenhuma categoria ainda</p>
            <p className="text-[#44445a] text-sm mt-1">Toque em + para criar</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-[92px] right-6 w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-2xl shadow-[0_4px_24px_rgba(124,58,237,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-40"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Add / Edit bottom sheet */}
      <BottomSheet isOpen={isAdd || isEdit} onClose={closeModal} title={isAdd ? 'Nova Categoria' : 'Editar Categoria'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.1em] mb-2">
              Nome
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.09] text-[#ededf5] rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all placeholder-[#3a3a5a]"
              placeholder="Ex: Alimentação, Transporte..."
            />
          </div>
          {formError && (
            <p className="text-rose-400 text-sm text-center -mb-1">{formError}</p>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-syne font-semibold rounded-2xl text-sm active:scale-95 transition-all disabled:opacity-50 shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
          >
            {isSaving ? 'Salvando...' : 'Salvar Categoria'}
          </button>
        </form>
      </BottomSheet>

      {/* Delete confirmation */}
      {delCat && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDelCat(null)} />
          <div className="relative w-full max-w-xs bg-[#0d0d22] border border-white/[0.1] rounded-2xl shadow-2xl p-5">
            <div className="mb-4">
              <p className="text-sm font-syne font-bold text-[#ededf5]">Remover categoria?</p>
              <p className="text-xs text-[#8080a0] mt-0.5">{delCat.name}</p>
            </div>
            <p className="text-xs text-[#606080] mb-5">
              Gastos vinculados a essa categoria serão afetados.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDelCat(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-[#a0a0c0] font-syne font-semibold text-sm hover:bg-white/[0.05] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMut.mutate(delCat.id)}
                disabled={deleteMut.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-syne font-semibold text-sm transition-all disabled:opacity-60 active:scale-95"
              >
                {deleteMut.isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
