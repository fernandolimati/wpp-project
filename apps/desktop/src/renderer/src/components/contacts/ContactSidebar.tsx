import { useEffect } from "react"
import { Avatar } from "../common/Avatar"
import { useChatStore } from "@/stores/chatStore"
import { useContactStore } from "@/stores/contactStore"
import type { Contact } from "@skydesk/shared"

export function ContactSidebar(): JSX.Element {
  const activeConversation = useChatStore((s) => s.activeConversation)
  const contacts = useContactStore((s) => s.contacts)
  const loadContacts = useContactStore((s) => s.loadContacts)

  useEffect(() => {
    loadContacts()
  }, [])

  // Find CRM contact linked to current conversation
  const linkedContact = contacts.find(
    (c: Contact) => c.whatsapp_jid === activeConversation
  )

  if (!linkedContact) {
    return (
      <div className="w-[300px] border-l border-gray-200 bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center text-sm text-gray-400">
          <p>No CRM contact linked</p>
          <p className="mt-1">to this conversation</p>
        </div>
      </div>
    )
  }

  const displayName = [linkedContact.first_name, linkedContact.last_name]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="w-[300px] border-l border-gray-200 bg-gray-50 overflow-y-auto">
      {/* Contact header */}
      <div className="p-6 text-center border-b border-gray-200">
        <Avatar name={displayName} size="lg" />
        <h3 className="mt-3 font-medium text-gray-900">{displayName}</h3>
        {linkedContact.company && (
          <p className="text-sm text-gray-500">{linkedContact.company}</p>
        )}
      </div>

      {/* Contact details */}
      <div className="p-4 space-y-3">
        {linkedContact.phone && (
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase">Phone</label>
            <p className="text-sm text-gray-700">{linkedContact.phone}</p>
          </div>
        )}
        {linkedContact.email && (
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase">Email</label>
            <p className="text-sm text-gray-700">{linkedContact.email}</p>
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase">Lead Score</label>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-skydesk-500 rounded-full transition-all"
                style={{ width: `${linkedContact.lead_score}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {linkedContact.lead_score}
            </span>
          </div>
        </div>
        {linkedContact.source && (
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase">Source</label>
            <p className="text-sm text-gray-700 capitalize">{linkedContact.source}</p>
          </div>
        )}
      </div>

      {/* Client DNA / Preferences */}
      {linkedContact.preferences && Object.keys(linkedContact.preferences).length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">
            Client DNA
          </h4>
          <div className="space-y-1">
            {Object.entries(linkedContact.preferences).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-500 capitalize">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-gray-700">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
