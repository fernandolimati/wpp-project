import type { WASocket } from "@whiskeysockets/baileys"
import { normalizeMessage } from "./normalize"
import * as db from "../database"
import { getMainWindow } from "../index"
import { showMessageNotification } from "../notifications"
import { updateTrayBadge } from "../tray"
import { IPC_CHANNELS } from "@skydesk/shared"

function emitToRenderer(channel: string, data?: unknown): void {
  const win = getMainWindow()
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, data)
  }
}

export function registerMessageHandlers(sock: WASocket, _sessionId: string): void {
  // New messages
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return

    for (const msg of messages) {
      const normalized = normalizeMessage(msg)
      db.upsertMessage(normalized)

      // Update conversation metadata
      db.updateConversation(normalized.jid, {
        last_message: normalized.content || "",
        last_timestamp: normalized.timestamp,
        unread_count: normalized.is_from_me ? 0 : 1,
      })

      emitToRenderer(IPC_CHANNELS.WA_MESSAGE_NEW, normalized)
      emitToRenderer(IPC_CHANNELS.WA_CONVERSATION_UPDATE, {
        jid: normalized.jid,
        last_message: normalized.content,
        last_timestamp: normalized.timestamp,
      })

      // Show notification for incoming messages
      if (!normalized.is_from_me) {
        const contacts = db.getWAContacts() as Array<{ jid: string; name?: string }>
        const contact = contacts.find((c) => c.jid === normalized.jid)
        const senderName = contact?.name || normalized.jid.split("@")[0]

        showMessageNotification(
          senderName,
          normalized.content || "New message",
          getMainWindow()
        )

        // Update tray badge
        const conversations = db.listConversations() as Array<{ unread_count: number }>
        const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
        updateTrayBadge(totalUnread)
      }
    }
  })

  // Message status updates (delivered/read)
  sock.ev.on("messages.update", (updates) => {
    for (const update of updates) {
      if (update.key.id && update.update.status) {
        const statusMap: Record<number, string> = {
          2: "sent",
          3: "delivered",
          4: "read",
        }
        const status = statusMap[update.update.status] || "sent"

        db.upsertMessage({
          id: update.key.id,
          jid: update.key.remoteJid || "",
          timestamp: Math.floor(Date.now() / 1000),
          is_from_me: update.key.fromMe || false,
          status,
        })

        emitToRenderer(IPC_CHANNELS.WA_MESSAGE_STATUS, {
          id: update.key.id,
          jid: update.key.remoteJid,
          status,
        })
      }
    }
  })

  // Contact updates
  sock.ev.on("contacts.upsert", (contacts) => {
    for (const contact of contacts) {
      db.upsertWAContact({
        jid: contact.id,
        name: contact.name || contact.notify,
        phone: contact.id.split("@")[0],
      })

      emitToRenderer(IPC_CHANNELS.WA_CONTACT_UPDATE, {
        jid: contact.id,
        name: contact.name || contact.notify,
      })

      // Auto-link to CRM contacts by phone
      const phone = contact.id.split("@")[0]
      const crmContacts = db.listContacts({ search: phone }) as Array<{
        id: string
        whatsapp_jid?: string
      }>
      if (crmContacts.length > 0 && !crmContacts[0].whatsapp_jid) {
        db.upsertContact({
          id: crmContacts[0].id,
          first_name: contact.name || contact.notify || phone,
          whatsapp_jid: contact.id,
        })
      } else if (crmContacts.length === 0) {
        // Create stub contact from WhatsApp
        db.upsertContact({
          first_name: contact.name || contact.notify || phone,
          phone,
          whatsapp_jid: contact.id,
          source: "whatsapp",
        })
      }
    }
  })
}
