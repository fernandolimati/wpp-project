import { downloadMediaMessage, type WAMessage, type WASocket } from "@whiskeysockets/baileys"
import { app } from "electron"
import { join } from "path"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import * as db from "../database"

const MEDIA_DIR = join(app.getPath("userData"), "media")

async function ensureMediaDir(): Promise<void> {
  if (!existsSync(MEDIA_DIR)) {
    await mkdir(MEDIA_DIR, { recursive: true })
  }
}

function getExtension(mimetype?: string | null): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "audio/ogg; codecs=opus": "ogg",
    "audio/mpeg": "mp3",
    "application/pdf": "pdf",
  }
  return map[mimetype || ""] || "bin"
}

export async function downloadMedia(
  msg: WAMessage,
  sock: WASocket
): Promise<string | null> {
  try {
    await ensureMediaDir()

    const buffer = await downloadMediaMessage(msg, "buffer", {}, {
      reuploadRequest: sock.updateMediaMessage,
    })

    const message = msg.message
    let mimetype: string | null | undefined

    if (message?.imageMessage) mimetype = message.imageMessage.mimetype
    else if (message?.videoMessage) mimetype = message.videoMessage.mimetype
    else if (message?.audioMessage) mimetype = message.audioMessage.mimetype
    else if (message?.documentMessage) mimetype = message.documentMessage.mimetype
    else if (message?.stickerMessage) mimetype = message.stickerMessage.mimetype

    const ext = getExtension(mimetype)
    const msgId = msg.key.id || crypto.randomUUID()
    const filePath = join(MEDIA_DIR, `${msgId}.${ext}`)

    await writeFile(filePath, buffer as Buffer)

    // Update message record with media path
    db.upsertMessage({
      id: msgId,
      jid: msg.key.remoteJid || "",
      timestamp: Math.floor(Date.now() / 1000),
      is_from_me: msg.key.fromMe || false,
      media_path: filePath,
    })

    return filePath
  } catch (error) {
    console.error("Media download failed:", error)
    return null
  }
}
