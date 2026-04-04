import { create } from "zustand"
import type { WAConnectionInfo } from "@skydesk/shared"

type View = "inbox" | "contacts" | "deals" | "settings"

interface UIState {
  searchQuery: string
  currentView: View
  showContactSidebar: boolean
  connectionInfo: WAConnectionInfo

  setSearchQuery: (query: string) => void
  setCurrentView: (view: View) => void
  toggleContactSidebar: () => void
  setConnectionInfo: (info: Partial<WAConnectionInfo>) => void
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: "",
  currentView: "inbox",
  showContactSidebar: false,
  connectionInfo: { state: "disconnected" },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setCurrentView: (view) => set({ currentView: view }),

  toggleContactSidebar: () =>
    set((state) => ({ showContactSidebar: !state.showContactSidebar })),

  setConnectionInfo: (info) =>
    set((state) => ({
      connectionInfo: { ...state.connectionInfo, ...info },
    })),
}))
