import { ipcMain } from "electron"
import { IPC_CHANNELS } from "@skydesk/shared"
import { createWASocket, getSession, disconnectSession } from "../whatsapp/socket"
import * as db from "../database"

const DEFAULT_SESSION = "default"

export function registerWhatsAppHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.WA_INIT, () => {
    return createWASocket(DEFAULT_SESSION)
  })

  ipcMain.handle(IPC_CHANNELS.WA_LOGOUT, async () => {
    await disconnectSession(DEFAULT_SESSION)
    db.clearAuth()
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.WA_SEND_MESSAGE, async (_event, payload) => {
    const session = getSession(DEFAULT_SESSION)
    if (!session) throw new Error("WhatsApp not connected")

    const { jid, text } = payload
    const result = await session.sendMessage(jid, { text })

    if (result) {
      const msgId = result.key.id || crypto.randomUUID()
      db.upsertMessage({
        id: msgId,
        jid,
        sender: result.key.fromMe ? session.user?.id : undefined,
        content: text,
        content_type: "text",
        timestamp: Math.floor(Date.now() / 1000),
        is_from_me: true,
        status: "sent",
      })

      db.updateConversation(jid, {
        last_message: text,
        last_timestamp: Math.floor(Date.now() / 1000),
      })
    }

    return result
  })

  ipcMain.handle(IPC_CHANNELS.WA_GET_HISTORY, (_event, payload) => {
    return db.listMessages(payload)
  })

  ipcMain.handle(IPC_CHANNELS.WA_GET_CONTACTS, () => {
    return db.getWAContacts()
  })

  ipcMain.handle(IPC_CHANNELS.WA_REQUEST_PAIRING, async (_event, payload) => {
    const session = getSession(DEFAULT_SESSION)
    if (!session) throw new Error("WhatsApp not initialized")

    const code = await session.requestPairingCode(payload.phoneNumber)
    return { code }
  })
}
