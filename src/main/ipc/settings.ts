import { ipcMain } from 'electron'
import Store from 'electron-store'

const store = new Store()

export function setupSettingsIpc(): void {
  ipcMain.handle('settings:get', async (_, key: string) => {
    return store.get(key)
  })

  ipcMain.handle('settings:set', async (_, { key, value }: { key: string; value: unknown }) => {
    store.set(key, value)
  })
}
