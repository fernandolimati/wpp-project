import { useChatStore } from '@/stores/chatStore'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'

export function ChatArea() {
  const activeChat = useChatStore((s) => s.getActiveChat())
  const messages = useChatStore((s) => s.getActiveChatMessages())
  const sendMessage = useChatStore((s) => s.sendMessage)

  if (!activeChat) return null

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatHeader chat={activeChat} />
      <MessageList messages={messages} />
      <MessageInput onSend={(content) => sendMessage(activeChat.id, content)} />
    </div>
  )
}
