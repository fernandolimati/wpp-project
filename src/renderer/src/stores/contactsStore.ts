import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Contact } from '../../../types/shared'

interface ContactsState {
  contacts: Record<string, Contact>
  setContacts: (contacts: Contact[]) => void
  updateContact: (contact: Contact) => void
  getContact: (id: string) => Contact | undefined
}

export const useContactsStore = create<ContactsState>()(
  immer((set, get) => ({
    contacts: {},

    setContacts: (contacts) =>
      set((state) => {
        for (const contact of contacts) {
          state.contacts[contact.id] = contact
        }
      }),

    updateContact: (contact) =>
      set((state) => {
        state.contacts[contact.id] = contact
      }),

    getContact: (id) => get().contacts[id]
  }))
)
