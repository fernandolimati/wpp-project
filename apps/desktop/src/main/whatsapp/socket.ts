import makeWASocket, {
  Browsers,
  DisconnectReason,
  type WASocket,
} from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import { loadAuthFromSQLite } from "./auth"
import { registerMessageHandlers } from "./handlers"
import { getMainWindow } from "../index"
import { IPC_CHANNELS } from "@skydesk/shared"
import * as db from "../database"

const sessions = new Map<string, WASocket>()
const reconnectTimers = new Map<string, ReturnType<typeof setTimeout>>()
const reconnectAttempts = new Map<string, number>()

const MAX_RECONNECT_ATTEMPTS = 10
const BASE_RECONNECT_DELAY = 2000
const MAX_RECONNECT_DELAY = 60000

function emitToRenderer(channel: string, data?: unknown): void {
  const win = getMainWindow()
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, data)
  }
}

export async function createWASocket(sessionId: string): Promise<void> {
  if (sessions.has(sessionId)) {
    const existing = sessions.get(sessionId)!
    existing.end(undefined)
    sessions.delete(sessionId)
  }

  const { state, saveCreds } = await loadAuthFromSQLite(sessionId)

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu("SkyDesk CRM"),
    getMessage: async (key) => {
      const msgs = db.listMessages({ jid: key.remoteJid!, limit: 1 })
      const msg = msgs[0] as { content?: string } | undefined
      if (msg?.content) {
        return { conversation: msg.content }
      }
      return undefined
    },
  })

  sessions.set(sessionId, sock)
  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      reconnectAttempts.set(sessionId, 0)
      emitToRenderer(IPC_CHANNELS.WA_QR, { qrCode: qr })
    }

    if (connection === "open") {
      reconnectAttempts.set(sessionId, 0)
      const jid = sock.user?.id
      const name = sock.user?.name
      db.setSetting("wa_session_id", sessionId)
      emitToRenderer(IPC_CHANNELS.WA_CONNECTED, { jid, name })
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
      const isLoggedOut = statusCode === DisconnectReason.loggedOut

      if (isLoggedOut) {
        sessions.delete(sessionId)
        reconnectAttempts.delete(sessionId)
        db.clearAuth()
        db.setSetting("wa_session_id", "")
        emitToRenderer(IPC_CHANNELS.WA_LOGGED_OUT)
      } else {
        const attempts = (reconnectAttempts.get(sessionId) || 0) + 1
        reconnectAttempts.set(sessionId, attempts)

        if (attempts <= MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            BASE_RECONNECT_DELAY * Math.pow(2, attempts - 1),
            MAX_RECONNECT_DELAY
          )

          emitToRenderer(IPC_CHANNELS.WA_RECONNECTING, {
            attempt: attempts,
            maxAttempts: MAX_RECONNECT_ATTEMPTS,
            nextRetryMs: delay,
          })

          const timer = setTimeout(() => {
            reconnectTimers.delete(sessionId)
            createWASocket(sessionId)
          }, delay)
          reconnectTimers.set(sessionId, timer)
        } else {
          emitToRenderer(IPC_CHANNELS.WA_LOGGED_OUT)
        }
      }
    }
  })

  registerMessageHandlers(sock, sessionId)
}

export function getSession(sessionId: string): WASocket | undefined {
  return sessions.get(sessionId)
}

export async function disconnectSession(sessionId: string): Promise<void> {
  const timer = reconnectTimers.get(sessionId)
  if (timer) {
    clearTimeout(timer)
    reconnectTimers.delete(sessionId)
  }

  const session = sessions.get(sessionId)
  if (session) {
    await session.logout()
    sessions.delete(sessionId)
  }

  reconnectAttempts.delete(sessionId)
}
