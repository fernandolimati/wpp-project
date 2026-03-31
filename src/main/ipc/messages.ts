import { ipcMain, BrowserWindow } from 'electron'
import { messagesRepo } from '../database/repositories/messages'
import { conversationsRepo } from '../database/repositories/conversations'
import { socketService } from '../services/socket'
import type { Message } from '../../types/shared'

export function setupMessagesIpc(win: BrowserWindow): void {
  ipcMain.handle(
    'messages:send',
    async (_, payload: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
      const message = messagesRepo.insert({ ...payload, status: 'sending' })
      conversationsRepo.updateLastMessage(payload.conversationId, message)
      socketService.emit('message:send', message)
      return message
    }
  )

  ipcMain.handle(
    'messages:getHistory',
    async (
      _,
      {
        conversationId,
        limit,
        before
      }: { conversationId: string; limit: number; before?: number }
    ) => {
      return messagesRepo.getHistory(conversationId, limit, before)
    }
  )

  ipcMain.handle('messages:markAsRead', async (_, messageIds: string[]) => {
    for (const id of messageIds) {
      messagesRepo.updateStatus(id, 'read')
    }
    socketService.emit('message:read', { messageIds })
  })

  ipcMain.handle(
    'messages:edit',
    async (_, { messageId, newContent }: { messageId: string; newContent: string }) => {
      messagesRepo.edit(messageId, newContent)
      socketService.emit('message:edit', { messageId, newContent })
    }
  )

  ipcMain.handle('messages:delete', async (_, messageId: string) => {
    messagesRepo.softDelete(messageId)
    socketService.emit('message:delete', { messageId })
  })

  ipcMain.handle(
    'search:messages',
    async (_, { query, limit }: { query: string; limit?: number }) => {
      return messagesRepo.search(query, limit)
    }
  )
}
