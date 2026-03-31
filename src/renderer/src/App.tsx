import { useEffect } from 'react'
import { TitleBar } from './components/Header/TitleBar'
import { Sidebar } from './components/Sidebar/Sidebar'
import { ChatWindow } from './components/ChatWindow/ChatWindow'
import { InputBar } from './components/InputBar/InputBar'
import { useRealtimeSync } from './hooks/useRealtimeSync'
import { useTheme } from './hooks/useTheme'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useConversationsStore } from './stores/conversationsStore'
import { useContactsStore } from './stores/contactsStore'

function App() {
  useRealtimeSync()
  useTheme()
  useKeyboardShortcuts()

  const setConversations = useConversationsStore((s) => s.setConversations)
  const setContacts = useContactsStore((s) => s.setContacts)

  // Load initial data
  useEffect(() => {
    window.api.conversations.getAll().then(setConversations)
    window.api.contacts.getAll().then(setContacts)
  }, [setConversations, setContacts])

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <ChatWindow />
          <InputBar />
        </div>
      </div>
    </div>
  )
}

export default App
