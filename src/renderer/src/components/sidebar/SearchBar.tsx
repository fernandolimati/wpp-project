import { Search, ArrowLeft } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useState } from 'react'

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useUIStore()
  const [focused, setFocused] = useState(false)

  return (
    <div className="px-3 py-2">
      <div className="relative flex items-center bg-wp-input-bg rounded-lg">
        <div className="absolute left-3 flex items-center justify-center w-5 h-5 text-wp-text-secondary">
          {focused ? (
            <ArrowLeft className="w-4 h-4 text-wp-green" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        <input
          type="text"
          placeholder="Pesquisar ou começar uma nova conversa"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full py-1.5 pl-10 pr-4 text-sm bg-transparent outline-none placeholder:text-wp-text-secondary"
        />
      </div>
    </div>
  )
}
