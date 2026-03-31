export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'audio' | 'video' | 'document'
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: number
  replyToId?: string | undefined
  editedAt?: number | undefined
  deletedAt?: number | undefined
  reactions?: Record<string, string[]> | undefined // emoji → userId[]
}

export interface Contact {
  id: string
  name: string
  avatarUrl?: string | undefined
  status: 'online' | 'offline' | 'away' | 'busy'
  lastSeen?: number | undefined
  phone?: string | undefined
}

export interface Conversation {
  id: string
  contactId: string
  isGroup: boolean
  name?: string | undefined
  iconUrl?: string | undefined
  lastMessage?: Message | undefined
  lastMessageAt: number
  unreadCount: number
  isPinned: boolean
  isArchived: boolean
  isMuted: boolean
  muteUntil?: number | undefined
}

export interface TypingIndicator {
  conversationId: string
  userId: string
  isTyping: boolean
}

export interface WebhookEvent {
  id: number
  payload: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  attempts: number
  createdAt: number
  processedAt?: number | undefined
}
