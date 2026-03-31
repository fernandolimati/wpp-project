import { ipcMain, dialog, protocol, net } from 'electron'
import { copyFileSync, mkdirSync } from 'fs'
import { join, extname } from 'path'
import { app } from 'electron'
import { nanoid } from 'nanoid'

export function setupMediaIpc(win: Electron.BrowserWindow): void {
  ipcMain.handle('media:selectFiles', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Imagens', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
        { name: 'Vídeos', extensions: ['mp4', 'webm', 'mov'] },
        { name: 'Documentos', extensions: ['pdf', 'docx', 'xlsx', 'txt'] },
        { name: 'Todos os arquivos', extensions: ['*'] }
      ]
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle(
    'media:uploadFile',
    async (_, { filePath, conversationId }: { filePath: string; conversationId: string }) => {
      const mediaId = nanoid()
      const ext = extname(filePath)
      const destDir = join(app.getPath('userData'), 'media', conversationId)
      const destPath = join(destDir, `${mediaId}${ext}`)

      mkdirSync(destDir, { recursive: true })
      copyFileSync(filePath, destPath)

      return mediaId
    }
  )

  ipcMain.handle('media:getLocalUrl', async (_, mediaId: string) => {
    return `app-media://${mediaId}`
  })
}

export function registerMediaProtocol(): void {
  protocol.handle('app-media', (request) => {
    const mediaId = request.url.replace('app-media://', '')
    // Validate: only allow alphanumeric + hyphen + underscore (nanoid chars)
    if (!/^[a-zA-Z0-9_-]+$/.test(mediaId)) {
      return new Response('Invalid media ID', { status: 400 })
    }
    const mediaDir = join(app.getPath('userData'), 'media')
    const filePath = join(mediaDir, mediaId)
    return net.fetch(`file://${filePath}`)
  })
}
