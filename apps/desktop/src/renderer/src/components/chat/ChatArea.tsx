import { ChatHeader } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"

export function ChatArea(): JSX.Element {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  )
}
