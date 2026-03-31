import { useEffect } from 'react'
import { useMessagesStore } from '../stores/messagesStore'
import { useConversationsStore } from '../stores/conversationsStore'

export function useMarkAsRead(conversationId: string | null): void {
  const messages = useMessagesStore((s) =>
    conversationId ? (s.messagesByConversation[conversationId] ?? []) : []
  )
  const clearUnread = useConversationsStore((s) => s.clearUnread)

  useEffect(() => {
    if (!conversationId) return
    const unread = messages
      .filter((m) => m.status === 'delivered' && m.senderId !== 'current-user-id')
      .map((m) => m.id)

    if (unread.length === 0) return

    window.api.messages.markAsRead(unread)
    clearUnread(conversationId)
  }, [conversationId, messages.length, clearUnread])
}
