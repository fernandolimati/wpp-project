import { create } from 'zustand'

interface UIState {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query })
}))
