import { MessageSquarePlus, MoreVertical, CircleDashed } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { SearchBar } from './SearchBar'
import { ChatList } from './ChatList'

export function Sidebar() {
  return (
    <div className="flex flex-col w-[400px] min-w-[340px] bg-wp-sidebar-bg border-r border-wp-border h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-wp-header">
        <Avatar name="Eu" size="sm" />
        <div className="flex items-center gap-3 text-wp-text-secondary">
          <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <CircleDashed className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <MessageSquarePlus className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <SearchBar />
      <ChatList />
    </div>
  )
}
