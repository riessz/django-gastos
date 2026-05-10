import { useEffect } from 'react'

export default function BottomSheet({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={`fixed inset-0 z-[70] flex items-end justify-center ${!isOpen && 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-xl bg-[#0d0d22] border border-white/[0.08] border-b-0 rounded-t-[28px] shadow-[0_-8px_60px_rgba(0,0,0,0.7)] overflow-y-auto max-h-[92vh] transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="sticky top-0 bg-[#0d0d22] pt-4 pb-3 px-5 z-10 rounded-t-[28px]">
          <div className="w-9 h-1 bg-white/[0.12] rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-syne font-bold text-[#ededf5]">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] flex items-center justify-center text-[#8080a0] hover:text-[#ededf5] transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-5 pb-10 pt-2">{children}</div>
      </div>
    </div>
  )
}
