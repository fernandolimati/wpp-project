import { Avatar } from "../common/Avatar"
import { useChatStore } from "@/stores/chatStore"
import type { WAConversation } from "@skydesk/shared"

interface ChatListItemProps {
  conversation: WAConversation & { name?: string; profile_pic_url?: string }
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return ""
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

export function ChatListItem({ conversation }: ChatListItemProps): JSX.Element {
  const activeConversation = useChatStore((s) => s.activeConversation)
  const setActiveConversation = useChatStore((s) => s.setActiveConversation)
  const isActive = activeConversation === conversation.jid

  const displayName = conversation.name || conversation.jid.split("@")[0]

  return (
    <button
      onClick={() => setActiveConversation(conversation.jid)}
      className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 transition-colors ${
        isActive ? "bg-gray-200" : ""
      }`}
    >
      <Avatar
        name={displayName}
        src={conversation.profile_pic_url}
        size="lg"
      />
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 truncate">
            {displayName}
          </span>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {formatTime(conversation.last_timestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-gray-500 truncate">
            {conversation.last_message || ""}
          </span>
          {conversation.unread_count > 0 && (
            <span className="ml-2 flex-shrink-0 w-5 h-5 bg-skydesk-500 text-white text-xs rounded-full flex items-center justify-center">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
