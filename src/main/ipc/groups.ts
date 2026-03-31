import { ipcMain } from 'electron'
import { getDb } from '../database'
import { nanoid } from 'nanoid'

export function setupGroupsIpc(): void {
  ipcMain.handle(
    'groups:create',
    async (_, { name, memberIds }: { name: string; memberIds: string[] }) => {
      const db = getDb()
      const groupId = nanoid()

      const insertGroup = db.prepare(
        `INSERT INTO conversations (id, is_group, name, last_message_at, created_at)
         VALUES (?, 1, ?, ?, ?)`
      )
      const insertMember = db.prepare(
        `INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)`
      )
      const insertSystemMessage = db.prepare(
        `INSERT INTO messages (id, conversation_id, sender_id, content, type, timestamp)
         VALUES (?, ?, 'system', ?, 'text', ?)`
      )

      db.transaction(() => {
        const now = Date.now()
        insertGroup.run(groupId, name, now, Math.floor(now / 1000))
        insertMember.run(groupId, 'current-user-id', 'admin')
        for (const memberId of memberIds) {
          insertMember.run(groupId, memberId, 'member')
        }
        insertSystemMessage.run(nanoid(), groupId, `Grupo "${name}" criado`, now)
      })()

      return groupId
    }
  )
}
