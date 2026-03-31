import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Conversation } from '../../../types/shared'

interface ConversationsState {
  conversations: Conversation[]
  activeConversationId: string | null
  setConversations: (convs: Conversation[]) => void
  updateConversation: (conv: Conversation) => void
  setActive: (id: string | null) => void
  incrementUnread: (id: string) => void
  clearUnread: (id: string) => void
}

export const useConversationsStore = create<ConversationsState>()(
  immer((set) => ({
    conversations: [],
    activeConversationId: null,

    setConversations: (convs) =>
      set((state) => {
        state.conversations = convs
      }),

    updateConversation: (conv) =>
      set((state) => {
        const idx = state.conversations.findIndex((c) => c.id === conv.id)
        if (idx >= 0) state.conversations[idx] = conv
        else state.conversations.unshift(conv)
        state.conversations.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
          return b.lastMessageAt - a.lastMessageAt
        })
      }),

    setActive: (id) =>
      set((state) => {
        state.activeConversationId = id
      }),

    incrementUnread: (id) =>
      set((state) => {
        const conv = state.conversations.find((c) => c.id === id)
        if (conv) conv.unreadCount++
      }),

    clearUnread: (id) =>
      set((state) => {
        const conv = state.conversations.find((c) => c.id === id)
        if (conv) conv.unreadCount = 0
      })
  }))
)
