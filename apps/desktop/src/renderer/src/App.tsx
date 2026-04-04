import { Sidebar } from "./components/sidebar/Sidebar"
import { ChatArea } from "./components/chat/ChatArea"
import { ContactSidebar } from "./components/contacts/ContactSidebar"
import { useChatStore } from "./stores/chatStore"
import { useUIStore } from "./stores/uiStore"

export function App(): JSX.Element {
  const activeConversation = useChatStore((s) => s.activeConversation)
  const showContactSidebar = useUIStore((s) => s.showContactSidebar)

  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <div className="flex flex-1 min-w-0">
        {activeConversation ? (
          <>
            <ChatArea />
            {showContactSidebar && <ContactSidebar />}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-wa-bg-chat">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-skydesk-500 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-light text-gray-600 mb-2">SkyDesk CRM</h2>
              <p className="text-sm text-gray-400">
                Select a conversation to start messaging, or connect your WhatsApp account
                in Settings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
