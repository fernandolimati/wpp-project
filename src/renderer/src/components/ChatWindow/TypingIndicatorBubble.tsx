import { usePresenceStore } from '../../stores/presenceStore'

interface Props {
  conversationId: string
}

export function TypingIndicatorBubble({ conversationId }: Props) {
  const typingMap = usePresenceStore((s) => s.typing[conversationId] ?? {})
  const isAnyoneTyping = Object.values(typingMap).some(Boolean)

  if (!isAnyoneTyping) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="bg-white dark:bg-[#202c33] rounded-lg px-3 py-2 shadow-sm inline-flex items-center gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
