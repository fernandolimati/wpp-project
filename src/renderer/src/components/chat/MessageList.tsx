import { useEffect, useRef } from 'react'
import { Message } from '@/types'
import { MessageBubble } from './MessageBubble'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'

interface MessageListProps {
  messages: Message[]
}

function formatDateSeparator(date: Date): string {
  if (isToday(date)) return 'HOJE'
  if (isYesterday(date)) return 'ONTEM'
  return format(date, 'dd/MM/yyyy')
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const renderMessages = () => {
    const elements: React.ReactNode[] = []
    let lastDate: Date | null = null

    messages.forEach((message) => {
      if (!lastDate || !isSameDay(lastDate, message.timestamp)) {
        elements.push(
          <div key={`date-${message.id}`} className="flex justify-center my-3">
            <span className="bg-white px-3 py-1 rounded-lg text-xs text-wp-text-secondary shadow-sm">
              {formatDateSeparator(message.timestamp)}
            </span>
          </div>
        )
        lastDate = message.timestamp
      }
      elements.push(<MessageBubble key={message.id} message={message} />)
    })

    return elements
  }

  return (
    <div className="flex-1 overflow-y-auto chat-bg px-12 py-2">
      {renderMessages()}
      <div ref={bottomRef} />
    </div>
  )
}
