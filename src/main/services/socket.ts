import { io, Socket } from 'socket.io-client'
import type { BrowserWindow } from 'electron'
import { messagesRepo } from '../database/repositories/messages'
import type { Message } from '../../types/shared'

class SocketService {
  private socket: Socket | null = null
  private win: BrowserWindow | null = null

  connect(serverUrl: string, token: string, win: BrowserWindow): void {
    // Don't reconnect if already connected
    if (this.socket?.connected) return

    this.win = win

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity
    })

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id)
      this.win?.webContents.send('socket:connected')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
      this.win?.webContents.send('socket:disconnected', reason)
    })

    // ─── Events received from server ──────────────────────────────
    this.socket.on('message:new', (message: Message) => {
      messagesRepo.insert(message)
      this.win?.webContents.send('messages:new', message)
    })

    this.socket.on('message:status', (update: { id: string; status: Message['status'] }) => {
      messagesRepo.updateStatus(update.id, update.status)
      this.win?.webContents.send('messages:statusUpdate', update)
    })

    this.socket.on(
      'message:edited',
      (data: { messageId: string; newContent: string; editedAt: number }) => {
        messagesRepo.edit(data.messageId, data.newContent)
        this.win?.webContents.send('messages:edited', data)
      }
    )

    this.socket.on('typing:indicator', (indicator) => {
      this.win?.webContents.send('typing:indicator', indicator)
    })

    this.socket.on('presence:update', (update) => {
      this.win?.webContents.send('contacts:presenceUpdate', update)
    })
  }

  emit(event: string, data?: unknown): void {
    if (!this.socket?.connected) {
      console.warn(`[Socket] Attempted emit "${event}" without connection`)
      return
    }
    this.socket.emit(event, data)
  }

  joinRoom(roomId: string): void {
    this.emit('room:join', { roomId })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }
}

export const socketService = new SocketService()
