import { useState, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ConversationItem } from './ConversationItem'
import { useConversationsStore } from '../../stores/conversationsStore'
import { useContactsStore } from '../../stores/contactsStore'

export function Sidebar() {
  const { conversations, activeConversationId, setActive } = useConversationsStore()
  const contacts = useContactsStore((s) => s.contacts)
  const [searchQuery, setSearchQuery] = useState('')
  const parentRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!searchQuery) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter((c) => {
      const contact = contacts[c.contactId]
      const name = c.isGroup ? (c.name ?? '') : (contact?.name ?? '')
      return (
        name.toLowerCase().includes(q) ||
        c.lastMessage?.content?.toLowerCase().includes(q)
      )
    })
  }, [conversations, searchQuery, contacts])

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5
  })

  return (
    <aside className="flex flex-col w-80 h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Sidebar header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="search"
          placeholder="Pesquisar ou começar nova conversa"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-search
          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Virtualized list */}
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const conv = filtered[virtualItem.index]!
            return (
              <div
                key={conv.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`
                }}
              >
                <ConversationItem
                  conversation={conv}
                  contact={contacts[conv.contactId]}
                  isActive={conv.id === activeConversationId}
                  onClick={() => setActive(conv.id)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
