import { memo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Message } from '../../../../types/shared'
import { MessageStatus } from './MessageStatus'

interface Props {
  message: Message
  isSent: boolean
}

export const MessageBubble = memo(function MessageBubble({ message, isSent }: Props) {
  const isDeleted = message.deletedAt != null

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-1 px-4`}>
      <div
        className={`
          max-w-[65%] rounded-lg px-3 py-2 shadow-sm
          ${
            isSent
              ? 'bg-[#dcf8c6] dark:bg-[#005c4b] rounded-br-none'
              : 'bg-white dark:bg-[#202c33] rounded-bl-none'
          }
        `}
      >
        {isDeleted ? (
          <p className="text-sm text-gray-400 italic">Mensagem apagada</p>
        ) : (
          <>
            {message.replyToId && (
              <div className="border-l-4 border-green-500 pl-2 mb-1 text-xs text-gray-500 truncate">
                Mensagem original
              </div>
            )}

            {message.type === 'text' && (
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}

            {message.type === 'image' && (
              <img
                src={message.content}
                alt="Imagem"
                className="max-w-full rounded-md"
                loading="lazy"
              />
            )}

            {message.type === 'audio' && (
              <audio controls className="max-w-full">
                <source src={message.content} />
              </audio>
            )}

            {message.type === 'document' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>&#128196;</span>
                <span className="truncate">{message.content}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-1 mt-1">
              {message.editedAt && (
                <span className="text-[10px] text-gray-400">editada</span>
              )}
              <span className="text-[10px] text-gray-400">
                {format(message.timestamp, 'HH:mm', { locale: ptBR })}
              </span>
              {isSent && <MessageStatus status={message.status} />}
            </div>
          </>
        )}
      </div>
    </div>
  )
})
