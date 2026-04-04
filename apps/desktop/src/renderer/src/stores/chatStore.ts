import { create } from "zustand"
import type { WAMessage, WAConversation } from "@skydesk/shared"

declare global {
  interface Window {
    skydesk: {
      wa: {
        init: () => Promise<void>
        logout: () => Promise<void>
        sendMessage: (payload: { jid: string; text?: string }) => Promise<unknown>
        getHistory: (payload: { jid: string; limit?: number; before?: number }) => Promise<unknown[]>
        getContacts: () => Promise<unknown[]>
        requestPairing: (payload: { phoneNumber: string }) => Promise<{ code: string }>
      }
      db: {
        contacts: {
          list: (payload?: { search?: string; limit?: number; offset?: number }) => Promise<unknown[]>
          upsert: (payload: Record<string, unknown>) => Promise<{ success: boolean }>
        }
        deals: {
          list: (payload?: { contact_id?: string; stage?: string; limit?: number; offset?: number }) => Promise<unknown[]>
          upsert: (payload: Record<string, unknown>) => Promise<{ success: boolean }>
        }
        messages: {
          list: (payload: { jid: string; limit?: number; before?: number }) => Promise<unknown[]>
        }
        conversations: {
          list: () => Promise<unknown[]>
        }
        sync: {
          status: () => Promise<{ pending: number }>
        }
      }
      cloud: {
        auth: {
          login: (payload: { email: string; password: string }) => Promise<unknown>
          session: () => Promise<unknown>
        }
        sync: {
          trigger: () => Promise<unknown>
        }
        ai: {
          draft: (payload: Record<string, unknown>) => Promise<unknown>
          score: (payload: { contactId: string }) => Promise<unknown>
        }
      }
      on: (channel: string, callback: (...args: unknown[]) => void) => unknown
      off: (channel: string, callback: (...args: unknown[]) => void) => void
    }
  }
}

interface ChatState {
  conversations: WAConversation[]
  messages: Record<string, WAMessage[]>
  activeConversation: string | null

  setConversations: (conversations: WAConversation[]) => void
  setActiveConversation: (jid: string | null) => void
  addMessage: (jid: string, message: WAMessage) => void
  setMessages: (jid: string, messages: WAMessage[]) => void
  updateConversation: (jid: string, data: Partial<WAConversation>) => void
  updateMessageStatus: (id: string, jid: string, status: string) => void

  loadConversations: () => Promise<void>
  loadMessages: (jid: string) => Promise<void>
  sendMessage: (jid: string, text: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversation: null,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (jid) => {
    set({ activeConversation: jid })
    if (jid) get().loadMessages(jid)
  },

  addMessage: (jid, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [jid]: [...(state.messages[jid] || []), message],
      },
    })),

  setMessages: (jid, messages) =>
    set((state) => ({
      messages: { ...state.messages, [jid]: messages },
    })),

  updateConversation: (jid, data) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.jid === jid ? { ...c, ...data } : c
      ),
    })),

  updateMessageStatus: (id, jid, status) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [jid]: (state.messages[jid] || []).map((m) =>
          m.id === id ? { ...m, status: status as WAMessage["status"] } : m
        ),
      },
    })),

  loadConversations: async () => {
    const conversations = (await window.skydesk.db.conversations.list()) as WAConversation[]
    set({ conversations })
  },

  loadMessages: async (jid) => {
    const messages = (await window.skydesk.db.messages.list({ jid, limit: 50 })) as WAMessage[]
    set((state) => ({
      messages: { ...state.messages, [jid]: messages.reverse() },
    }))
  },

  sendMessage: async (jid, text) => {
    // Optimistic UI
    const optimisticMsg: WAMessage = {
      id: `temp-${Date.now()}`,
      jid,
      content: text,
      content_type: "text",
      timestamp: Math.floor(Date.now() / 1000),
      is_from_me: true,
      status: "pending",
      synced: false,
    }
    get().addMessage(jid, optimisticMsg)
    get().updateConversation(jid, {
      last_message: text,
      last_timestamp: optimisticMsg.timestamp,
    })

    await window.skydesk.wa.sendMessage({ jid, text })
  },
}))
