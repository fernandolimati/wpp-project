import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Message } from '../../../types/shared'

interface MessagesState {
  messagesByConversation: Record<string, Message[]>
  hasMore: Record<string, boolean>
  setMessages: (conversationId: string, messages: Message[], hasMore: boolean) => void
  prependMessages: (conversationId: string, messages: Message[], hasMore: boolean) => void
  addMessage: (message: Message) => void
  updateMessageStatus: (messageId: string, status: Message['status']) => void
  editMessage: (messageId: string, newContent: string, editedAt: number) => void
  deleteMessage: (messageId: string) => void
}

export const useMessagesStore = create<MessagesState>()(
  immer((set) => ({
    messagesByConversation: {},
    hasMore: {},

    setMessages: (convId, messages, hasMore) =>
      set((state) => {
        state.messagesByConversation[convId] = [...messages].reverse()
        state.hasMore[convId] = hasMore
      }),

    prependMessages: (convId, messages, hasMore) =>
      set((state) => {
        const existing = state.messagesByConversation[convId] ?? []
        state.messagesByConversation[convId] = [...messages.reverse(), ...existing]
        state.hasMore[convId] = hasMore
      }),

    addMessage: (message) =>
      set((state) => {
        const msgs = state.messagesByConversation[message.conversationId] ?? []
        if (!msgs.find((m) => m.id === message.id)) {
          msgs.push(message)
        }
        state.messagesByConversation[message.conversationId] = msgs
      }),

    updateMessageStatus: (messageId, status) =>
      set((state) => {
        for (const msgs of Object.values(state.messagesByConversation)) {
          const msg = msgs.find((m) => m.id === messageId)
          if (msg) {
            msg.status = status
            break
          }
        }
      }),

    editMessage: (messageId, newContent, editedAt) =>
      set((state) => {
        for (const msgs of Object.values(state.messagesByConversation)) {
          const msg = msgs.find((m) => m.id === messageId)
          if (msg) {
            msg.content = newContent
            msg.editedAt = editedAt
            break
          }
        }
      }),

    deleteMessage: (messageId) =>
      set((state) => {
        for (const msgs of Object.values(state.messagesByConversation)) {
          const idx = msgs.findIndex((m) => m.id === messageId)
          if (idx >= 0) {
            msgs.splice(idx, 1)
            break
          }
        }
      })
  }))
)
