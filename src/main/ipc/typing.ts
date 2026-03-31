import { ipcMain } from 'electron'
import { socketService } from '../services/socket'

export function setupTypingIpc(): void {
  ipcMain.on('typing:start', (_, conversationId: string) => {
    socketService.emit('typing:start', { conversationId })
  })

  ipcMain.on('typing:stop', (_, conversationId: string) => {
    socketService.emit('typing:stop', { conversationId })
  })
}
