import { apiFetch } from './client'

export const listSubscriptions = () => apiFetch('/api/subscriptions/')

export const createSubscription = (data) =>
  apiFetch('/api/subscriptions/', { method: 'POST', body: JSON.stringify(data) })

export const updateSubscription = ({ id, ...data }) =>
  apiFetch(`/api/subscriptions/${id}/`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteSubscription = (id) =>
  apiFetch(`/api/subscriptions/${id}/`, { method: 'DELETE' })

export const togglePayment = (id) =>
  apiFetch(`/api/subscriptions/${id}/toggle-payment/`, { method: 'POST' })
