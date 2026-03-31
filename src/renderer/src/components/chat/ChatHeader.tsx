import { Search, MoreVertical } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { Chat } from '@/types'

interface ChatHeaderProps {
  chat: Chat
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  const { contact } = chat

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-wp-header border-l border-wp-border">
      <div className="flex items-center gap-3 cursor-pointer">
        <Avatar
          name={contact.name}
          src={contact.avatar || undefined}
          size="sm"
          online={contact.online}
        />
        <div>
          <h2 className="text-base font-medium leading-tight">{contact.name}</h2>
          <p className="text-xs text-wp-text-secondary">
            {contact.online ? 'online' : `visto por último hoje`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-wp-text-secondary">
        <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
