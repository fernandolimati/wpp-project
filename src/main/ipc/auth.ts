import { ipcMain, safeStorage } from 'electron'
import Store from 'electron-store'
import { socketService } from '../services/socket'
import { config } from '../config'
import type { BrowserWindow } from 'electron'

const store = new Store()

export function setupAuthIpc(win: BrowserWindow): void {
  ipcMain.handle(
    'auth:login',
    async (_, { username, password }: { username: string; password: string }) => {
      try {
        const response = await fetch(`${config.backendUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        })

        if (!response.ok) throw new Error('Credenciais inválidas')
        const { token, userId } = (await response.json()) as {
          token: string
          userId: string
        }

        // Store token with OS-level encryption
        if (safeStorage.isEncryptionAvailable()) {
          store.set('encryptedToken', safeStorage.encryptString(token).toString('base64'))
        } else {
          store.set('token', token)
        }
        store.set('userId', userId)
        store.set('username', username)

        socketService.connect(config.backendUrl, token, win)

        return { success: true, token }
      } catch (error) {
        return { success: false, error: (error as Error).message }
      }
    }
  )

  ipcMain.handle('auth:getSession', async () => {
    const userId = store.get('userId') as string | undefined
    const username = store.get('username') as string | undefined
    if (!userId || !username) return null

    // Reconnect socket if session exists
    const encryptedToken = store.get('encryptedToken') as string | undefined
    if (encryptedToken && safeStorage.isEncryptionAvailable()) {
      const token = safeStorage.decryptString(Buffer.from(encryptedToken, 'base64'))
      socketService.connect(config.backendUrl, token, win)
    }

    return { userId, username }
  })

  ipcMain.handle('auth:logout', async () => {
    socketService.disconnect()
    store.delete('encryptedToken')
    store.delete('token')
    store.delete('userId')
    store.delete('username')
  })
}
