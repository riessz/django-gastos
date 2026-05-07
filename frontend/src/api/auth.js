import { apiFetch } from './client'

export const getCsrfCookie = () => apiFetch('/api/auth/csrf/')
export const getMe = () => apiFetch('/api/auth/me/')
export const login = (username, password) =>
  apiFetch('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
export const logout = () =>
  apiFetch('/api/auth/logout/', { method: 'POST' })
