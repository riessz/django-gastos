import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import BottomSheet from '../components/modals/BottomSheet'
import { listCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'

export default function Categories() {
  const [modal, setModal] = useState(null) // null | 'add' | { type: 'edit', cat }
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

  function openAdd() {
    setName('')
    setModal('add')
  }

  function openEdit(cat) {
    setName(cat.name)
    setModal({ type: 'edit', cat })
  }

  function closeModal() {
    setModal(null)
    setName('')
    setFormError('')
  }

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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto p-4">

        {/* Header */}
        <div className="py-4 mb-2">
          <div className="flex items-center gap-3 mb-4">
            <Link
              to="/"
              className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors text-lg flex-shrink-0"
            >←</Link>
            <h1 className="text-lg font-bold">Categorias</h1>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total de Categorias</p>
            <p className="text-3xl font-bold tabular-nums">{categories.length}</p>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-emerald-500 animate-spin" />
          </div>
        ) : categories.length > 0 ? (
          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</span>
            </div>
            <div className="divide-y divide-gray-800">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-900/40 flex items-center justify-center text-sm flex-shrink-0">
                      🏷️
                    </div>
                    <span className="text-sm font-semibold">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-violet-900/40 flex items-center justify-center transition-colors text-gray-400 hover:text-violet-400"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDelCat(cat)}
                      className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-rose-900/40 flex items-center justify-center transition-colors text-gray-400 hover:text-rose-400"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl p-14 text-center">
            <div className="text-5xl mb-4">🏷️</div>
            <p className="text-gray-400 font-semibold">Nenhuma categoria ainda</p>
            <p className="text-gray-600 text-sm mt-1">Toque em + para criar</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-7 right-6 w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-2xl shadow-lg shadow-violet-500/30 flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all duration-200 z-40"
      >+</button>

      {/* Add / Edit bottom sheet */}
      <BottomSheet
        isOpen={isAdd || isEdit}
        onClose={closeModal}
        title={isAdd ? 'Nova Categoria' : 'Editar Categoria'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Nome
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-600"
              placeholder="Ex: Alimentação, Transporte..."
            />
          </div>
          {formError && (
            <p className="text-rose-400 text-sm text-center -mb-1">{formError}</p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-violet-600 text-white font-semibold rounded-2xl text-sm active:scale-95 transition-all disabled:opacity-60"
          >
            {isSaving ? 'Salvando...' : 'Salvar Categoria'}
          </button>
        </form>
      </BottomSheet>

      {/* Delete confirmation (centered modal) */}
      {delCat && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDelCat(null)}
          />
          <div className="relative w-full max-w-xs bg-gray-900 rounded-2xl shadow-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-900/40 flex items-center justify-center flex-shrink-0 text-xl">
                🗑️
              </div>
              <div>
                <p className="text-sm font-bold text-white">Remover categoria?</p>
                <p className="text-xs text-gray-400 mt-0.5">{delCat.name}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Gastos vinculados a essa categoria serão afetados.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDelCat(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMut.mutate(delCat.id)}
                disabled={deleteMut.isPending}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
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
