import { useEffect, useState } from "react"
import { Avatar } from "../common/Avatar"
import { useContactStore } from "@/stores/contactStore"
import type { Contact } from "@skydesk/shared"

export function ContactList(): JSX.Element {
  const contacts = useContactStore((s) => s.contacts)
  const loadContacts = useContactStore((s) => s.loadContacts)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadContacts(search || undefined)
  }, [search])

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-14 px-4 flex items-center border-b border-gray-200">
        <h2 className="text-lg font-semibold">Contacts</h2>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 bg-gray-100 rounded-lg text-sm outline-none focus:bg-white focus:ring-1 focus:ring-skydesk-500"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400">No contacts found</div>
        ) : (
          contacts.map((contact: Contact) => {
            const displayName = [contact.first_name, contact.last_name]
              .filter(Boolean)
              .join(" ")
            return (
              <div
                key={contact.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              >
                <Avatar name={displayName} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {contact.company || contact.phone || contact.email || ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {contact.whatsapp_jid && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      WA
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{contact.lead_score}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
