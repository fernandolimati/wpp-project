import { getDb } from '../index'
import type { Conversation, Message } from '../../../types/shared'

function mapRow(row: Record<string, unknown>): Conversation {
  return {
    id: row['id'] as string,
    contactId: row['contact_id'] as string,
    isGroup: Boolean(row['is_group']),
    name: (row['name'] as string) || undefined,
    iconUrl: (row['icon_url'] as string) || undefined,
    lastMessageAt: row['last_message_at'] as number,
    unreadCount: row['unread_count'] as number,
    isPinned: Boolean(row['is_pinned']),
    isArchived: Boolean(row['is_archived']),
    isMuted: Boolean(row['is_muted']),
    muteUntil: (row['mute_until'] as number) || undefined
  }
}

export const conversationsRepo = {
  getAll(): Conversation[] {
    const db = getDb()
    const rows = db
      .prepare(
        `SELECT * FROM conversations
         WHERE is_archived = 0
         ORDER BY is_pinned DESC, last_message_at DESC`
      )
      .all() as Record<string, unknown>[]
    return rows.map(mapRow)
  },

  updateLastMessage(conversationId: string, message: Message): void {
    getDb()
      .prepare('UPDATE conversations SET last_message_at = ? WHERE id = ?')
      .run(message.timestamp, conversationId)
  },

  incrementUnread(conversationId: string): void {
    getDb()
      .prepare('UPDATE conversations SET unread_count = unread_count + 1 WHERE id = ?')
      .run(conversationId)
  },

  clearUnread(conversationId: string): void {
    getDb()
      .prepare('UPDATE conversations SET unread_count = 0 WHERE id = ?')
      .run(conversationId)
  },

  archive(conversationId: string): void {
    getDb()
      .prepare('UPDATE conversations SET is_archived = 1 WHERE id = ?')
      .run(conversationId)
  },

  pin(conversationId: string, pinned: boolean): void {
    getDb()
      .prepare('UPDATE conversations SET is_pinned = ? WHERE id = ?')
      .run(pinned ? 1 : 0, conversationId)
  },

  mute(conversationId: string, until: number | null): void {
    getDb()
      .prepare('UPDATE conversations SET is_muted = ?, mute_until = ? WHERE id = ?')
      .run(until ? 1 : 0, until, conversationId)
  },

  markUnread(conversationId: string): void {
    getDb()
      .prepare(
        'UPDATE conversations SET unread_count = CASE WHEN unread_count = 0 THEN 1 ELSE unread_count END WHERE id = ?'
      )
      .run(conversationId)
  }
}
