import { Avatar } from "../common/Avatar"
import { useChatStore } from "@/stores/chatStore"
import { useUIStore } from "@/stores/uiStore"
import type { WAConversation } from "@skydesk/shared"

type ConversationWithMeta = WAConversation & { name?: string; profile_pic_url?: string }

export function ChatHeader(): JSX.Element {
  const activeConversation = useChatStore((s) => s.activeConversation)
  const conversations = useChatStore((s) => s.conversations) as ConversationWithMeta[]
  const toggleContactSidebar = useUIStore((s) => s.toggleContactSidebar)

  const conversation = conversations.find((c) => c.jid === activeConversation)
  const displayName = conversation?.name || activeConversation?.split("@")[0] || ""

  return (
    <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 bg-gray-50">
      <button onClick={toggleContactSidebar} className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-2 py-1 -ml-2">
        <Avatar name={displayName} src={conversation?.profile_pic_url} />
        <div>
          <h3 className="text-sm font-medium text-gray-900">{displayName}</h3>
        </div>
      </button>
      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-gray-200 rounded-full text-gray-500" title="Search">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
