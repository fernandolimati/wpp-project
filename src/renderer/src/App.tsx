import { Sidebar } from '@/components/sidebar/Sidebar'
import { ChatArea } from '@/components/chat/ChatArea'
import { EmptyState } from '@/components/common/EmptyState'
import { useChatStore } from '@/stores/chatStore'

export default function App() {
  const activeChatId = useChatStore((s) => s.activeChatId)

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      {activeChatId ? <ChatArea /> : <EmptyState />}
    </div>
  )
}
