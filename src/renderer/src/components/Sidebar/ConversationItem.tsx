import { memo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Conversation, Contact } from '../../../../types/shared'

interface Props {
  conversation: Conversation
  contact: Contact | undefined
  isActive: boolean
  onClick: () => void
}

export const ConversationItem = memo(function ConversationItem({
  conversation,
  contact,
  isActive,
  onClick
}: Props) {
  const displayName = conversation.isGroup
    ? (conversation.name ?? 'Grupo')
    : (contact?.name ?? 'Contato')

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`
        flex items-center gap-3 px-4 py-3 cursor-pointer
        hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
        ${isActive ? 'bg-gray-100 dark:bg-gray-800' : ''}
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white text-lg font-medium">
          {contact?.avatarUrl ? (
            <img
              src={contact.avatarUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
        {contact?.status === 'online' && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {displayName}
          </span>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {conversation.lastMessageAt > 0
              ? formatDistanceToNow(conversation.lastMessageAt, {
                  locale: ptBR,
                  addSuffix: false
                })
              : ''}
          </span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span className="text-sm text-gray-500 truncate">
            {conversation.lastMessage?.content ?? ''}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
})
