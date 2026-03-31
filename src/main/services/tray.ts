import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'

let tray: Tray | null = null

export function setupTray(mainWindow: BrowserWindow): void {
  const iconPath = join(__dirname, '../../resources/tray-icon.png')
  try {
    tray = new Tray(nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 }))
  } catch {
    // Fallback: create empty tray icon if image not found
    tray = new Tray(nativeImage.createEmpty())
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    {
      label: 'Silenciar notificações',
      type: 'checkbox',
      checked: false,
      click: (_item) => {
        // Mute global logic placeholder
      }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        mainWindow.removeAllListeners('close')
        app.quit()
      }
    }
  ])

  tray.setToolTip('WPP App')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  // Minimize to tray on close
  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow.hide()
  })
}

export function setTrayBadge(count: number): void {
  if (!tray) return
  if (process.platform === 'darwin') {
    app.dock.setBadge(count > 0 ? String(count) : '')
  }
  tray.setToolTip(count > 0 ? `${count} mensagens não lidas` : 'WPP App')
}
