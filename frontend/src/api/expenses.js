import { apiFetch } from './client'

export const listExpenses = (month, year) =>
  apiFetch(`/api/expenses/?month=${month}&year=${year}`)

export const createExpense = (data) =>
  apiFetch('/api/expenses/', { method: 'POST', body: JSON.stringify(data) })

export const updateExpense = ({ id, ...data }) =>
  apiFetch(`/api/expenses/${id}/`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteExpense = (id) =>
  apiFetch(`/api/expenses/${id}/`, { method: 'DELETE' })
