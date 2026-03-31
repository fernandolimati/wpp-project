import { app, BrowserWindow, shell, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { setupTray } from './services/tray'
import { setupIpcHandlers } from './ipc'
import { initDatabase } from './database'
import { setupAutoUpdater } from './services/updater'
import { registerMediaProtocol } from './ipc/media'
import Store from 'electron-store'

const windowStore = new Store<{ bounds: Electron.Rectangle }>()
let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const savedBounds = windowStore.get('bounds', {
    width: 1200,
    height: 760,
    x: undefined,
    y: undefined
  })

  mainWindow = new BrowserWindow({
    width: savedBounds.width,
    height: savedBounds.height,
    x: savedBounds.x,
    y: savedBounds.y,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', () => {
    if (mainWindow) {
      windowStore.set('bounds', mainWindow.getBounds())
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_, argv) => {
    const url = argv.find((arg) => arg.startsWith('myapp://'))
    if (url) handleDeepLink(url)
    mainWindow?.show()
    mainWindow?.focus()
  })
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.wppproject.app')
  app.on('browser-window-created', (_, window) => optimizer.watchShortcuts(window))

  registerMediaProtocol()
  await initDatabase()
  createWindow()
  setupTray(mainWindow!)
  setupIpcHandlers(mainWindow!)
  setupAutoUpdater(mainWindow!)

  // Global shortcut: toggle window visibility
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (mainWindow?.isVisible()) mainWindow.hide()
    else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => globalShortcut.unregisterAll())

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Deep link protocol
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('myapp', process.execPath, [process.argv[1]!])
  }
} else {
  app.setAsDefaultProtocolClient('myapp')
}

app.on('open-url', (event, url) => {
  event.preventDefault()
  handleDeepLink(url)
})

function handleDeepLink(url: string): void {
  try {
    const parsed = new URL(url)
    if (parsed.pathname.startsWith('/chat/')) {
      const contactId = parsed.pathname.replace('/chat/', '')
      mainWindow?.webContents.send('deeplink:openChat', { contactId })
    }
  } catch {
    // Invalid URL, ignore
  }
}

export { mainWindow }
