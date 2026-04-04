import { useChatStore } from "@/stores/chatStore"
import { useUIStore } from "@/stores/uiStore"
import { ChatListItem } from "./ChatListItem"
import type { WAConversation } from "@skydesk/shared"

type ConversationWithMeta = WAConversation & { name?: string; profile_pic_url?: string }

export function ChatList(): JSX.Element {
  const conversations = useChatStore((s) => s.conversations) as ConversationWithMeta[]
  const searchQuery = useUIStore((s) => s.searchQuery)

  const filtered = searchQuery
    ? conversations.filter((c) => {
        const name = c.name || c.jid
        return name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : conversations

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return (b.last_timestamp || 0) - (a.last_timestamp || 0)
  })

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-400 p-4">
        {searchQuery ? "No conversations found" : "No conversations yet"}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {sorted.map((conversation) => (
        <ChatListItem key={conversation.jid} conversation={conversation} />
      ))}
    </div>
  )
}
