import { ipcMain } from "electron"
import { IPC_CHANNELS } from "@skydesk/shared"
import * as db from "../database"

export function registerDatabaseHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.DB_CONTACTS_LIST, (_event, params) => {
    return db.listContacts(params)
  })

  ipcMain.handle(IPC_CHANNELS.DB_CONTACTS_UPSERT, (_event, payload) => {
    db.upsertContact(payload)
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.DB_DEALS_LIST, (_event, params) => {
    return db.listDeals(params)
  })

  ipcMain.handle(IPC_CHANNELS.DB_DEALS_UPSERT, (_event, payload) => {
    db.upsertDeal(payload)
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.DB_MESSAGES_LIST, (_event, params) => {
    return db.listMessages(params)
  })

  ipcMain.handle(IPC_CHANNELS.DB_CONVERSATIONS_LIST, () => {
    return db.listConversations()
  })

  ipcMain.handle(IPC_CHANNELS.DB_SYNC_STATUS, () => {
    const pending = db.getPendingSyncQueue()
    return { pending: pending.length }
  })
}
