import { useEffect, useRef, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { useMessagesStore } from '../../stores/messagesStore'
import { useConversationsStore } from '../../stores/conversationsStore'
import { TypingIndicatorBubble } from './TypingIndicatorBubble'
import { useMarkAsRead } from '../../hooks/useMarkAsRead'

const PAGE_SIZE = 40

export function ChatWindow() {
  const { activeConversationId } = useConversationsStore()
  const { messagesByConversation, hasMore, setMessages, prependMessages } = useMessagesStore()
  const parentRef = useRef<HTMLDivElement>(null)
  const messages = activeConversationId
    ? (messagesByConversation[activeConversationId] ?? [])
    : []
  const isLoadingMore = useRef(false)

  useMarkAsRead(activeConversationId)

  // Load initial history
  useEffect(() => {
    if (!activeConversationId) return
    window.api.messages.getHistory(activeConversationId, PAGE_SIZE).then((msgs) => {
      setMessages(activeConversationId, msgs, msgs.length === PAGE_SIZE)
    })
  }, [activeConversationId, setMessages])

  // Scroll to bottom on conversation change
  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = parentRef.current.scrollHeight
    }
  }, [activeConversationId])

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10
  })

  // Infinite reverse scroll
  const handleScroll = useCallback(async () => {
    if (!parentRef.current || !activeConversationId || isLoadingMore.current) return
    if (parentRef.current.scrollTop > 100) return
    if (!hasMore[activeConversationId]) return

    isLoadingMore.current = true
    const oldest = messages[0]
    const older = await window.api.messages.getHistory(
      activeConversationId,
      PAGE_SIZE,
      oldest?.timestamp
    )
    prependMessages(activeConversationId, older, older.length === PAGE_SIZE)
    isLoadingMore.current = false
  }, [activeConversationId, messages, hasMore, prependMessages])

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] dark:bg-[#111b21]">
        <div className="text-center">
          <h2 className="text-2xl text-gray-500 mb-2">WPP App</h2>
          <p className="text-gray-400">Selecione uma conversa para começar</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto bg-[#efeae2] dark:bg-[#0d1418] py-2"
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index]!
          return (
            <div
              key={message.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <MessageBubble
                message={message}
                isSent={message.senderId === 'current-user-id'}
              />
            </div>
          )
        })}
      </div>
      <TypingIndicatorBubble conversationId={activeConversationId} />
    </div>
  )
}
