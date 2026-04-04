import { useEffect, useRef } from "react"
import { useChatStore } from "@/stores/chatStore"
import { MessageBubble } from "./MessageBubble"

function DateSeparator({ date }: { date: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center my-3">
      <span className="bg-white text-gray-500 text-xs px-3 py-1 rounded-lg shadow-sm">
        {date}
      </span>
    </div>
  )
}

function formatDateLabel(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) return "Today"

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
}

export function MessageList(): JSX.Element {
  const activeConversation = useChatStore((s) => s.activeConversation)
  const messages = useChatStore((s) =>
    activeConversation ? s.messages[activeConversation] || [] : []
  )
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  let lastDateLabel = ""

  return (
    <div className="flex-1 overflow-y-auto px-12 py-4 bg-wa-bg-chat">
      {messages.map((msg) => {
        const dateLabel = formatDateLabel(msg.timestamp)
        const showDate = dateLabel !== lastDateLabel
        lastDateLabel = dateLabel

        return (
          <div key={msg.id}>
            {showDate && <DateSeparator date={dateLabel} />}
            <MessageBubble message={msg} />
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
