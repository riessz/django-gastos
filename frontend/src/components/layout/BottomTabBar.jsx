import { NavLink } from 'react-router-dom'

function HomeIcon({ active }) {
  const c = active ? '#a78bfa' : '#50507a'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"
        fill={active ? 'rgba(167,139,250,0.12)' : 'none'}
        stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 21V12h6v9" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function ExpenseIcon({ active }) {
  const c = active ? '#a78bfa' : '#50507a'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2"
        fill={active ? 'rgba(167,139,250,0.12)' : 'none'}
        stroke={c} strokeWidth="1.8" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SubIcon({ active }) {
  const c = active ? '#a78bfa' : '#50507a'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1.02 6.63 2.68"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 3v6h-6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CatIcon({ active }) {
  const c = active ? '#a78bfa' : '#50507a'
  const f = active ? 'rgba(167,139,250,0.12)' : 'none'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill={f} stroke={c} strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill={f} stroke={c} strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill={f} stroke={c} strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill={f} stroke={c} strokeWidth="1.8" />
    </svg>
  )
}

const tabs = [
  { to: '/', label: 'Início', Icon: HomeIcon },
  { to: '/expenses', label: 'Gastos', Icon: ExpenseIcon },
  { to: '/subscriptions', label: 'Assinat.', Icon: SubIcon },
  { to: '/categories', label: 'Categ.', Icon: CatIcon },
]

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-2xl mx-auto px-4">
        <div className="pointer-events-auto bg-[#0a0a18]/95 backdrop-blur-2xl border border-white/[0.08] rounded-[22px] mb-4 flex items-stretch shadow-[0_-2px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)]">
          {tabs.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className="flex-1">
              {({ isActive }) => (
                <div className={`flex flex-col items-center gap-1.5 py-3 mx-1 my-1.5 rounded-[16px] transition-all duration-200 ${isActive ? 'bg-violet-500/[0.1]' : ''}`}>
                  <Icon active={isActive} />
                  <span className={`text-[10px] font-syne font-semibold tracking-wide transition-colors duration-200 ${isActive ? 'text-violet-400' : 'text-[#50507a]'}`}>
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
