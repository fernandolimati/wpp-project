import { Chat } from '@/types'
import { Avatar } from '@/components/common/Avatar'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, CheckCheck, Pin } from 'lucide-react'

interface ChatListItemProps {
  chat: Chat
  isActive: boolean
  onClick: () => void
}

function formatChatTime(date: Date): string {
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Ontem'
  return format(date, 'dd/MM/yyyy')
}

function MessageStatus({ status }: { status: string }) {
  if (status === 'read') return <CheckCheck className="w-4 h-4 text-sky-500" />
  if (status === 'delivered') return <CheckCheck className="w-4 h-4 text-wp-text-secondary" />
  return <Check className="w-4 h-4 text-wp-text-secondary" />
}

export function ChatListItem({ chat, isActive, onClick }: ChatListItemProps) {
  const { contact, lastMessage, unreadCount, pinned } = chat

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-wp-input-bg transition-colors',
        isActive && 'bg-wp-input-bg'
      )}
    >
      <Avatar name={contact.name} src={contact.avatar || undefined} online={contact.online} />

      <div className="flex-1 min-w-0 border-b border-wp-border pb-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[17px] truncate">{contact.name}</span>
          {lastMessage && (
            <span
              className={cn(
                'text-xs flex-shrink-0 ml-2',
                unreadCount > 0 ? 'text-wp-green font-medium' : 'text-wp-text-secondary'
              )}
            >
              {formatChatTime(lastMessage.timestamp)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {lastMessage?.sender === 'me' && (
              <MessageStatus status={lastMessage.status} />
            )}
            <span className="text-sm text-wp-text-secondary truncate">
              {lastMessage?.content || 'Sem mensagens'}
            </span>
          </div>

          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {pinned && <Pin className="w-3.5 h-3.5 text-wp-text-secondary rotate-45" />}
            {unreadCount > 0 && (
              <span className="bg-wp-green text-white text-xs font-medium rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
