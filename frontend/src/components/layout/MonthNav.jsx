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
    <div className="flex items-center justify-center gap-4 mb-5">
      <button
        onClick={prev}
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-lg"
      >
        ‹
      </button>
      <span className="text-white font-medium text-sm w-36 text-center">
        {MONTHS[month]} {year}
      </span>
      <button
        onClick={next}
        disabled={isCurrent}
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-lg disabled:opacity-25 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  )
}
