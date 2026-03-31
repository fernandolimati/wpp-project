import { create } from 'zustand'
import type { Contact, TypingIndicator } from '../../../types/shared'

interface PresenceState {
  statuses: Record<string, Contact['status']>
  typing: Record<string, Record<string, boolean>>
  setStatus: (contactId: string, status: Contact['status']) => void
  setTyping: (indicator: TypingIndicator) => void
}

export const usePresenceStore = create<PresenceState>()((set) => ({
  statuses: {},
  typing: {},
  setStatus: (contactId, status) =>
    set((state) => ({ statuses: { ...state.statuses, [contactId]: status } })),
  setTyping: ({ conversationId, userId, isTyping }) =>
    set((state) => ({
      typing: {
        ...state.typing,
        [conversationId]: { ...state.typing[conversationId], [userId]: isTyping }
      }
    }))
}))
