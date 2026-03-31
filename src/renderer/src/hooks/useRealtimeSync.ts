import { useEffect } from 'react'
import { useMessagesStore } from '../stores/messagesStore'
import { usePresenceStore } from '../stores/presenceStore'
import { useConversationsStore } from '../stores/conversationsStore'
import type { Message } from '../../../types/shared'

/**
 * Registers all IPC listeners for realtime events.
 * Mount once at the app root (App.tsx).
 */
export function useRealtimeSync(): void {
  const { addMessage, updateMessageStatus, editMessage } = useMessagesStore()
  const { setStatus, setTyping } = usePresenceStore()
  const { updateConversation, incrementUnread, activeConversationId } = useConversationsStore()

  useEffect(() => {
    const cleanups: Array<() => void> = []

    cleanups.push(
      window.api.messages.onNew((message: Message) => {
        addMessage(message)
        if (message.conversationId !== activeConversationId) {
          incrementUnread(message.conversationId)
        }
      })
    )

    cleanups.push(
      window.api.messages.onStatusUpdate((update) => {
        updateMessageStatus(update.id, update.status)
      })
    )

    cleanups.push(
      window.api.messages.onEdited((data) => {
        editMessage(data.messageId, data.newContent, data.editedAt)
      })
    )

    cleanups.push(
      window.api.typing.onIndicator((indicator) => {
        setTyping(indicator)
      })
    )

    cleanups.push(
      window.api.contacts.onPresenceUpdate((update) => {
        setStatus(update.contactId, update.status)
      })
    )

    cleanups.push(
      window.api.conversations.onUpdate((conv) => {
        updateConversation(conv)
      })
    )

    return () => cleanups.forEach((fn) => fn())
  }, [activeConversationId, addMessage, updateMessageStatus, editMessage, setStatus, setTyping, updateConversation, incrementUnread])
}
