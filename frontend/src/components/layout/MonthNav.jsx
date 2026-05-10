const MONTHS = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default function MonthNav({ month, year, onChange }) {
  const now = new Date()
  const isCurrent = month === now.getMonth() + 1 && year === now.getFullYear()

  function prev() {
    if (month === 1) onChange(12, year - 1)
    else onChange(month - 1, year)
  }

  function next() {
    if (month === 12) onChange(1, year + 1)
    else onChange(month + 1, year)
  }

  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <button
        onClick={prev}
        className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#8080a0] hover:text-[#ededf5] hover:bg-white/[0.09] transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <span className="text-[#ededf5] font-syne font-semibold text-sm w-36 text-center">
        {MONTHS[month]} {year}
      </span>

      <button
        onClick={next}
        disabled={isCurrent}
        className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#8080a0] hover:text-[#ededf5] hover:bg-white/[0.09] transition-all disabled:opacity-25 disabled:cursor-not-allowed"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}
