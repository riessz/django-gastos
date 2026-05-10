import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { getCsrfCookie, login } from '../api/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => { getCsrfCookie() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      queryClient.setQueryData(['auth', 'me'], user)
      navigate('/')
    } catch {
      setError('Usuário ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070710] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-700/[0.07] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-violet-900/[0.05] rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-[60px] h-[60px] rounded-[18px] bg-gradient-to-br from-violet-500 to-violet-700 mb-5 shadow-[0_0_50px_rgba(124,58,237,0.4)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <h1 className="text-[34px] font-syne font-bold tracking-tight text-white leading-none mb-2">
            gastos
          </h1>
          <p className="text-sm text-[#8080a0]">seu controle financeiro pessoal</p>
        </div>

        {/* Form card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6">
          {error && (
            <div className="bg-rose-500/[0.08] border border-rose-500/[0.2] rounded-xl px-4 py-3 text-rose-400 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.12em] mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.09] text-[#ededf5] rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all placeholder-[#3a3a5a]"
                placeholder="seu usuário"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[10px] font-syne font-semibold text-[#8080a0] uppercase tracking-[0.12em] mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.09] text-[#ededf5] rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all placeholder-[#3a3a5a]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-syne font-semibold py-3.5 rounded-xl text-sm tracking-wide transition-all duration-200 shadow-[0_4px_28px_rgba(124,58,237,0.35)] hover:shadow-[0_4px_36px_rgba(124,58,237,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
