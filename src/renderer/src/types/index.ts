export interface Contact {
  id: string
  name: string
  avatar: string
  phone: string
  about: string
  lastSeen: Date
  online: boolean
}

export type MessageStatus = 'sent' | 'delivered' | 'read'
export type MessageType = 'text' | 'image' | 'audio' | 'document'

export interface Message {
  id: string
  chatId: string
  content: string
  timestamp: Date
  sender: 'me' | 'them'
  status: MessageStatus
  type: MessageType
}

export interface Chat {
  id: string
  contact: Contact
  lastMessage: Message | null
  unreadCount: number
  pinned: boolean
}
