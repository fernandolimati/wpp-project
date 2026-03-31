import { useState, useEffect } from 'react'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const cleanup = window.api.window.onMaximized(setIsMaximized)
    return cleanup
  }, [])

  return (
    <header className="titlebar-drag flex items-center justify-between h-8 bg-[#00a884] dark:bg-[#202c33] px-2 select-none">
      <span className="text-white text-xs font-medium pl-2">WPP App</span>
      <div className="titlebar-no-drag flex items-center">
        <button
          onClick={() => window.api.window.minimize()}
          className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Minimizar"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </button>
        <button
          onClick={() => window.api.window.maximize()}
          className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={isMaximized ? 'Restaurar' : 'Maximizar'}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="0" width="8" height="8" rx="0.5" />
              <rect x="0" y="2" width="8" height="8" rx="0.5" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="0.5" y="0.5" width="9" height="9" rx="0.5" />
            </svg>
          )}
        </button>
        <button
          onClick={() => window.api.window.close()}
          className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500 transition-colors"
          aria-label="Fechar"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="0" y1="0" x2="10" y2="10" />
            <line x1="10" y1="0" x2="0" y2="10" />
          </svg>
        </button>
      </div>
    </header>
  )
}
