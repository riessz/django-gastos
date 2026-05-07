import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMe } from './api/auth'
import Login from './pages/Login'
import Home from './pages/Home'

function Spinner() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-emerald-500 animate-spin" />
    </div>
  )
}

function ComingSoon({ title }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
      <p className="text-4xl">🚧</p>
      <p className="text-gray-300 font-medium">{title}</p>
      <p className="text-gray-600 text-sm">Fase em implementação</p>
      <Link to="/" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors mt-2">
        ← Voltar ao dashboard
      </Link>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
  })

  if (isLoading) return <Spinner />
  if (isError || !user) return <Navigate to="/login" replace />
  return children
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><ComingSoon title="Despesas" /></PrivateRoute>} />
        <Route path="/subscriptions" element={<PrivateRoute><ComingSoon title="Assinaturas" /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><ComingSoon title="Categorias" /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
