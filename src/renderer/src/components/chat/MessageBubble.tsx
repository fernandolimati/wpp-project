import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Check, CheckCheck } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
}

function MessageStatus({ status }: { status: string }) {
  if (status === 'read') return <CheckCheck className="w-4 h-4 text-sky-500" />
  if (status === 'delivered') return <CheckCheck className="w-4 h-4 text-wp-text-secondary/70" />
  return <Check className="w-4 h-4 text-wp-text-secondary/70" />
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMine = message.sender === 'me'

  return (
    <div className={cn('flex mb-1', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'relative max-w-[65%] px-2.5 py-1.5 rounded-lg shadow-sm',
          isMine ? 'bg-wp-bubble-out' : 'bg-wp-bubble-in',
          isMine ? 'rounded-tr-none' : 'rounded-tl-none'
        )}
      >
        {/* Tail */}
        <div
          className={cn(
            'absolute top-0 w-3 h-3 overflow-hidden',
            isMine ? '-right-2.5' : '-left-2.5'
          )}
        >
          <div
            className={cn(
              'w-4 h-4 transform rotate-45 origin-bottom-left',
              isMine ? 'bg-wp-bubble-out -translate-x-2' : 'bg-wp-bubble-in translate-x-1'
            )}
          />
        </div>

        <div className="flex items-end gap-1">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <span className="flex items-center gap-0.5 text-[11px] text-wp-text-secondary/70 flex-shrink-0 pb-0.5 ml-1">
            {format(message.timestamp, 'HH:mm')}
            {isMine && <MessageStatus status={message.status} />}
          </span>
        </div>
      </div>
    </div>
  )
}
