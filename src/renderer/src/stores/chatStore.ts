import { create } from 'zustand'
import { Chat, Message } from '@/types'
import { mockChats, mockMessages } from '@/data/mock'

interface ChatState {
  chats: Chat[]
  messages: Record<string, Message[]>
  activeChatId: string | null

  setActiveChat: (chatId: string) => void
  sendMessage: (chatId: string, content: string) => void
  getActiveChat: () => Chat | undefined
  getActiveChatMessages: () => Message[]
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: mockChats,
  messages: mockMessages,
  activeChatId: null,

  setActiveChat: (chatId: string) => {
    set((state) => ({
      activeChatId: chatId,
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    }))
  },

  sendMessage: (chatId: string, content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      content,
      timestamp: new Date(),
      sender: 'me',
      status: 'sent',
      type: 'text'
    }

    set((state) => {
      const chatMessages = [...(state.messages[chatId] || []), newMessage]
      const updatedChats = state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, lastMessage: newMessage } : chat
      )

      return {
        messages: { ...state.messages, [chatId]: chatMessages },
        chats: updatedChats
      }
    })

    // Simulate delivery status after 1s
    setTimeout(() => {
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: (state.messages[chatId] || []).map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        }
      }))
    }, 1000)
  },

  getActiveChat: () => {
    const { chats, activeChatId } = get()
    return chats.find((c) => c.id === activeChatId)
  },

  getActiveChatMessages: () => {
    const { messages, activeChatId } = get()
    if (!activeChatId) return []
    return messages[activeChatId] || []
  }
}))
