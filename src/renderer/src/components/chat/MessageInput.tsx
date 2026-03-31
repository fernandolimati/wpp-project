import { useState, KeyboardEvent } from 'react'
import { Smile, Paperclip, Mic, SendHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSend: (content: string) => void
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('')

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasText = text.trim().length > 0

  return (
    <div className="flex items-end gap-2 px-4 py-3 bg-wp-header border-l border-wp-border">
      <button className="p-2 rounded-full hover:bg-black/5 text-wp-text-secondary transition-colors flex-shrink-0">
        <Smile className="w-6 h-6" />
      </button>
      <button className="p-2 rounded-full hover:bg-black/5 text-wp-text-secondary transition-colors flex-shrink-0">
        <Paperclip className="w-6 h-6" />
      </button>

      <div className="flex-1 bg-white rounded-lg border border-wp-border">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem"
          rows={1}
          className="w-full px-3 py-2 text-sm bg-transparent outline-none resize-none max-h-32 placeholder:text-wp-text-secondary"
          style={{ minHeight: '40px' }}
        />
      </div>

      <button
        onClick={hasText ? handleSend : undefined}
        className={cn(
          'p-2 rounded-full transition-colors flex-shrink-0',
          hasText
            ? 'text-wp-text-secondary hover:bg-black/5'
            : 'text-wp-text-secondary hover:bg-black/5'
        )}
      >
        {hasText ? (
          <SendHorizontal className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>
    </div>
  )
}
