import { useState, useRef } from "react"
import { useChatStore } from "@/stores/chatStore"

export function MessageInput(): JSX.Element {
  const [text, setText] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const activeConversation = useChatStore((s) => s.activeConversation)
  const sendMessage = useChatStore((s) => s.sendMessage)

  const handleSend = (): void => {
    if (!text.trim() || !activeConversation) return
    sendMessage(activeConversation, text.trim())
    setText("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-auto min-h-[62px] px-4 py-2 flex items-end gap-2 bg-gray-50 border-t border-gray-200">
      <button className="p-2 hover:bg-gray-200 rounded-full text-gray-500 mb-0.5" title="Attach">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message"
        rows={1}
        className="flex-1 resize-none bg-white rounded-lg px-4 py-2 text-sm outline-none border border-gray-200 focus:border-skydesk-500 max-h-32 overflow-y-auto"
        style={{ minHeight: "38px" }}
      />
      {text.trim() ? (
        <button
          onClick={handleSend}
          className="p-2 hover:bg-skydesk-600 bg-skydesk-500 rounded-full text-white mb-0.5"
          title="Send"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      ) : (
        <button className="p-2 hover:bg-gray-200 rounded-full text-gray-500 mb-0.5" title="Voice">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}
    </div>
  )
}
