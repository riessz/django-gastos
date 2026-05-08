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
    <div className={`fixed inset-0 z-50 flex items-end justify-center ${!isOpen && 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-xl bg-gray-900 rounded-t-3xl shadow-2xl overflow-y-auto max-h-[92vh] transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="sticky top-0 bg-gray-900 pt-3 pb-2 px-5 z-10 rounded-t-3xl">
          <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 text-xl leading-none transition-colors"
            >
              ×
            </button>
          </div>
        </div>
        <div className="px-5 pb-10 pt-2">{children}</div>
      </div>
    </div>
  )
}
