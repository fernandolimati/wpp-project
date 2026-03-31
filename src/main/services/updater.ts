import { autoUpdater } from 'electron-updater'
import type { BrowserWindow } from 'electron'

export function setupAutoUpdater(win: BrowserWindow): void {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    win.webContents.send('updater:available', { version: info.version })
  })

  autoUpdater.on('download-progress', (progress) => {
    win.webContents.send('updater:progress', { percent: Math.round(progress.percent) })
  })

  autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('updater:downloaded', { version: info.version })
  })

  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err)
  })

  // Check for updates 10s after startup
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {
      // Expected to fail in dev mode
    })
  }, 10_000)
}
