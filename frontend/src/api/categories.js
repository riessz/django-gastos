import { apiFetch } from './client'

export const listCategories = () => apiFetch('/api/categories/')

export const createCategory = (name) =>
  apiFetch('/api/categories/', { method: 'POST', body: JSON.stringify({ name }) })

export const updateCategory = ({ id, name }) =>
  apiFetch(`/api/categories/${id}/`, { method: 'PUT', body: JSON.stringify({ name }) })

export const deleteCategory = (id) =>
  apiFetch(`/api/categories/${id}/`, { method: 'DELETE' })
