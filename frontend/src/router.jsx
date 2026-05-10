import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMe } from './api/auth'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Expenses from './pages/Expenses'
import Subscriptions from './pages/Subscriptions'
import Categories from './pages/Categories'

function Spinner() {
  return (
    <div className="min-h-screen bg-[#070710] flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-2 border-white/[0.08] border-t-violet-500 animate-spin" />
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
  return <Layout>{children}</Layout>
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
        <Route path="/subscriptions" element={<PrivateRoute><Subscriptions /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
