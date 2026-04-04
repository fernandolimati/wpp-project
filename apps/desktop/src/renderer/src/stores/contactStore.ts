import { create } from "zustand"
import type { Contact } from "@skydesk/shared"

interface ContactState {
  contacts: Contact[]
  selectedContact: Contact | null

  setContacts: (contacts: Contact[]) => void
  setSelectedContact: (contact: Contact | null) => void
  loadContacts: (search?: string) => Promise<void>
  saveContact: (contact: Partial<Contact>) => Promise<void>
}

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  selectedContact: null,

  setContacts: (contacts) => set({ contacts }),
  setSelectedContact: (contact) => set({ selectedContact: contact }),

  loadContacts: async (search) => {
    const contacts = (await window.skydesk.db.contacts.list({
      search,
      limit: 100,
    })) as Contact[]
    set({ contacts })
  },

  saveContact: async (contact) => {
    await window.skydesk.db.contacts.upsert(contact)
    const contacts = (await window.skydesk.db.contacts.list({ limit: 100 })) as Contact[]
    set({ contacts })
  },
}))
