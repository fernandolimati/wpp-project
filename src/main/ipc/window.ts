import { ipcMain, BrowserWindow } from 'electron'

export function setupWindowIpc(win: BrowserWindow): void {
  ipcMain.on('window:minimize', () => win.minimize())
  ipcMain.on('window:maximize', () => {
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })
  ipcMain.on('window:close', () => win.hide())
  ipcMain.on('window:quit', () => {
    win.removeAllListeners('close')
    win.close()
  })

  win.on('maximize', () => win.webContents.send('window:maximized', true))
  win.on('unmaximize', () => win.webContents.send('window:maximized', false))
}
