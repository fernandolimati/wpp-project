import { useChatStore } from '@/stores/chatStore'
import { useUIStore } from '@/stores/uiStore'
import { ChatListItem } from './ChatListItem'

export function ChatList() {
  const { chats, activeChatId, setActiveChat } = useChatStore()
  const { searchQuery } = useUIStore()

  const filteredChats = chats.filter((chat) =>
    chat.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    const aTime = a.lastMessage?.timestamp.getTime() || 0
    const bTime = b.lastMessage?.timestamp.getTime() || 0
    return bTime - aTime
  })

  return (
    <div className="flex-1 overflow-y-auto">
      {sortedChats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onClick={() => setActiveChat(chat.id)}
        />
      ))}

      {filteredChats.length === 0 && (
        <div className="flex items-center justify-center py-8 text-sm text-wp-text-secondary">
          Nenhuma conversa encontrada
        </div>
      )}
    </div>
  )
}
