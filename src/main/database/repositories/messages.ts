import { getDb } from '../index'
import { nanoid } from 'nanoid'
import type { Message } from '../../../types/shared'

// Map DB snake_case rows to camelCase Message
function mapRow(row: Record<string, unknown>): Message {
  return {
    id: row['id'] as string,
    conversationId: row['conversation_id'] as string,
    senderId: row['sender_id'] as string,
    content: row['content'] as string,
    type: row['type'] as Message['type'],
    status: row['status'] as Message['status'],
    timestamp: row['timestamp'] as number,
    replyToId: (row['reply_to_id'] as string) || undefined,
    editedAt: (row['edited_at'] as number) || undefined,
    deletedAt: (row['deleted_at'] as number) || undefined
  }
}

export const messagesRepo = {
  insert(msg: Omit<Message, 'id' | 'timestamp'> & { id?: string; timestamp?: number }): Message {
    const db = getDb()
    const id = msg.id ?? nanoid()
    const timestamp = msg.timestamp ?? Date.now()
    db.prepare(
      `INSERT OR IGNORE INTO messages (id, conversation_id, sender_id, content, type, status, timestamp, reply_to_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      msg.conversationId,
      msg.senderId,
      msg.content,
      msg.type,
      msg.status ?? 'sent',
      timestamp,
      msg.replyToId ?? null
    )
    return { ...msg, id, timestamp, status: msg.status ?? 'sent' } as Message
  },

  getHistory(conversationId: string, limit: number, before?: number): Message[] {
    const db = getDb()
    const rows = before
      ? (db
          .prepare(
            `SELECT * FROM messages
             WHERE conversation_id = ? AND timestamp < ? AND deleted_at IS NULL
             ORDER BY timestamp DESC LIMIT ?`
          )
          .all(conversationId, before, limit) as Record<string, unknown>[])
      : (db
          .prepare(
            `SELECT * FROM messages
             WHERE conversation_id = ? AND deleted_at IS NULL
             ORDER BY timestamp DESC LIMIT ?`
          )
          .all(conversationId, limit) as Record<string, unknown>[])
    return rows.map(mapRow)
  },

  updateStatus(messageId: string, status: Message['status']): void {
    getDb().prepare('UPDATE messages SET status = ? WHERE id = ?').run(status, messageId)
  },

  edit(messageId: string, newContent: string): void {
    getDb()
      .prepare('UPDATE messages SET content = ?, edited_at = ? WHERE id = ?')
      .run(newContent, Date.now(), messageId)
  },

  softDelete(messageId: string): void {
    getDb()
      .prepare('UPDATE messages SET deleted_at = ?, content = NULL WHERE id = ?')
      .run(Date.now(), messageId)
  },

  search(
    query: string,
    limit = 50
  ): (Message & { highlighted_content?: string })[] {
    const db = getDb()
    try {
      const rows = db
        .prepare(
          `SELECT m.*, highlight(messages_fts, 0, '<mark>', '</mark>') as highlighted_content
           FROM messages_fts
           JOIN messages m ON m.id = messages_fts.message_id
           WHERE messages_fts MATCH ?
           ORDER BY rank
           LIMIT ?`
        )
        .all(query, limit) as Record<string, unknown>[]
      return rows.map((row) => ({
        ...mapRow(row),
        highlighted_content: row['highlighted_content'] as string | undefined
      }))
    } catch {
      // FTS table may not exist yet
      return []
    }
  }
}
