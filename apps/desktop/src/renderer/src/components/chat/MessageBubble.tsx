import type { WAMessage } from "@skydesk/shared"

interface MessageBubbleProps {
  message: WAMessage
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function StatusIcon({ status }: { status?: string }): JSX.Element | null {
  if (!status) return null

  const icons: Record<string, JSX.Element> = {
    pending: (
      <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    sent: (
      <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 8l3 3 5-6" />
      </svg>
    ),
    delivered: (
      <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 8l3 3 5-6" />
        <path d="M6 8l3 3 5-6" />
      </svg>
    ),
    read: (
      <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 8l3 3 5-6" />
        <path d="M6 8l3 3 5-6" />
      </svg>
    ),
  }

  return icons[status] || null
}

export function MessageBubble({ message }: MessageBubbleProps): JSX.Element {
  const isOutgoing = message.is_from_me

  return (
    <div className={`flex ${isOutgoing ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`max-w-[65%] rounded-lg px-3 py-1.5 shadow-sm ${
          isOutgoing
            ? "bg-wa-bubble-out text-gray-900 rounded-tr-none"
            : "bg-wa-bubble-in text-gray-900 rounded-tl-none"
        }`}
      >
        {message.content_type === "image" && message.media_path && (
          <img
            src={`file://${message.media_path}`}
            alt=""
            className="rounded max-w-full mb-1"
          />
        )}
        {message.content_type === "audio" && (
          <div className="flex items-center gap-2 py-1">
            <svg className="w-8 h-8 text-skydesk-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <span className="text-sm text-gray-500">Audio message</span>
          </div>
        )}
        {message.content_type === "document" && (
          <div className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded mb-1">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-600 truncate">
              {(() => {
                try {
                  return JSON.parse(message.content || "{}").fileName || "Document"
                } catch {
                  return "Document"
                }
              })()}
            </span>
          </div>
        )}
        {(message.content_type === "text" || !message.content_type) && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {isOutgoing && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  )
}
