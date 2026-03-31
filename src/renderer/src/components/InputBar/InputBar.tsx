import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { useConversationsStore } from '../../stores/conversationsStore'

const TYPING_DEBOUNCE_MS = 1500

export function InputBar() {
  const { activeConversationId } = useConversationsStore()
  const [text, setText] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTyping = useRef(false)

  const handleTypingSignal = useCallback(() => {
    if (!activeConversationId) return
    if (!isTyping.current) {
      isTyping.current = true
      window.api.typing.sendStart(activeConversationId)
    }
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      isTyping.current = false
      window.api.typing.sendStop(activeConversationId!)
    }, TYPING_DEBOUNCE_MS)
  }, [activeConversationId])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    if (e.target.value) handleTypingSignal()
  }

  const sendMessage = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || !activeConversationId) return

    setText('')
    setShowEmojis(false)

    if (typingTimer.current) clearTimeout(typingTimer.current)
    if (isTyping.current) {
      isTyping.current = false
      window.api.typing.sendStop(activeConversationId)
    }

    await window.api.messages.send({
      conversationId: activeConversationId,
      senderId: 'current-user-id',
      content: trimmed,
      type: 'text'
    })
  }, [text, activeConversationId])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji)
  }

  const handleAttach = async () => {
    const files = await window.api.media.selectFiles()
    if (files.length > 0) {
      // TODO: implement file upload flow with MediaPreview
      console.log('Selected files:', files)
    }
  }

  if (!activeConversationId) return null

  return (
    <div className="relative flex items-end gap-2 px-4 py-3 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-gray-200 dark:border-gray-700">
      {/* Emoji picker */}
      {showEmojis && (
        <div className="absolute bottom-16 left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Emoji button */}
      <button
        onClick={() => setShowEmojis((v) => !v)}
        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Emojis"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </button>

      {/* Attach button */}
      <button
        onClick={handleAttach}
        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Anexar arquivo"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
      </button>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Digite uma mensagem"
        rows={1}
        className="flex-1 resize-none bg-white dark:bg-[#2a3942] rounded-lg px-4 py-2 text-sm outline-none max-h-32 overflow-y-auto text-gray-900 dark:text-gray-100"
        style={{ height: 'auto' }}
        onInput={(e) => {
          const el = e.target as HTMLTextAreaElement
          el.style.height = 'auto'
          el.style.height = `${Math.min(el.scrollHeight, 128)}px`
        }}
      />

      {/* Send button */}
      <button
        onClick={sendMessage}
        disabled={!text.trim()}
        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Enviar mensagem"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  )
}
