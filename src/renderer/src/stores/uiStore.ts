import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  theme: Theme
  fontSize: 'small' | 'medium' | 'large'
  isSidebarOpen: boolean
  activeModal: string | null
  setTheme: (theme: Theme) => void
  setFontSize: (size: UIState['fontSize']) => void
  toggleSidebar: () => void
  openModal: (id: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      fontSize: 'medium',
      isSidebarOpen: true,
      activeModal: null,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null })
    }),
    { name: 'ui-preferences' }
  )
)
