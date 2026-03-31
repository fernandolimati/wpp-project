import { ipcMain } from 'electron'
import { getDb } from '../database'

export function setupDashboardIpc(): void {
  ipcMain.handle('dashboard:getStats', async () => {
    const db = getDb()
    return {
      totalMessages: db.prepare('SELECT COUNT(*) as count FROM messages').get(),
      messagesLast24h: db
        .prepare('SELECT COUNT(*) as count FROM messages WHERE timestamp > ?')
        .get(Date.now() - 86400000),
      webhookQueuePending: db
        .prepare("SELECT COUNT(*) as count FROM webhook_queue WHERE status = 'pending'")
        .get()
    }
  })
}
