import { ipcMain } from 'electron'
import { contactsRepo } from '../database/repositories/contacts'

export function setupContactsIpc(): void {
  ipcMain.handle('contacts:getAll', async () => {
    return contactsRepo.getAll()
  })
}
