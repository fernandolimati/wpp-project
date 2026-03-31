import { getDb } from '../index'
import type { Contact } from '../../../types/shared'

function mapRow(row: Record<string, unknown>): Contact {
  return {
    id: row['id'] as string,
    name: row['name'] as string,
    avatarUrl: (row['avatar_url'] as string) || undefined,
    status: (row['status'] as Contact['status']) || 'offline',
    lastSeen: (row['last_seen'] as number) || undefined,
    phone: (row['phone'] as string) || undefined
  }
}

export const contactsRepo = {
  getAll(): Contact[] {
    const db = getDb()
    const rows = db.prepare('SELECT * FROM contacts ORDER BY name').all() as Record<
      string,
      unknown
    >[]
    return rows.map(mapRow)
  },

  getById(id: string): Contact | undefined {
    const db = getDb()
    const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id) as
      | Record<string, unknown>
      | undefined
    return row ? mapRow(row) : undefined
  },

  updateStatus(contactId: string, status: Contact['status']): void {
    getDb().prepare('UPDATE contacts SET status = ?, last_seen = ? WHERE id = ?').run(
      status,
      Date.now(),
      contactId
    )
  }
}
