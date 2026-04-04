import type { WAMessage } from "@whiskeysockets/baileys"

export interface NormalizedMessage {
  id: string
  jid: string
  sender?: string
  content?: string
  content_type: string
  timestamp: number
  media_path?: string
  is_from_me: boolean
  status: string
}

export function normalizeMessage(msg: WAMessage): NormalizedMessage {
  const key = msg.key
  const jid = key.remoteJid || ""
  const id = key.id || ""
  const is_from_me = key.fromMe || false
  const timestamp = typeof msg.messageTimestamp === "number"
    ? msg.messageTimestamp
    : Number(msg.messageTimestamp) || Math.floor(Date.now() / 1000)

  const message = msg.message
  if (!message) {
    return {
      id,
      jid,
      sender: key.participant || undefined,
      content: undefined,
      content_type: "text",
      timestamp,
      is_from_me,
      status: "sent",
    }
  }

  // Text message
  if (message.conversation) {
    return {
      id,
      jid,
      sender: key.participant || undefined,
      content: message.conversation,
      content_type: "text",
      timestamp,
      is_from_me,
      status: "sent",
    }
  }

  if (message.extendedTextMessage?.text) {
    return {
      id,
      jid,
      sender: key.participant || undefined,
      content: message.extendedTextMessage.text,
      content_type: "text",
      timestamp,
      is_from_me,
      status: "sent",
    }
  }

  // Image
  if (message.imageMessage) {
    return {
      id,
      jid,
      sender: key.participant || undefined,
      content: message.imageMessage.caption || "[Image]",
      content_type: "image",
      timestamp,
      is_from_me,
      status: "sent",
    }
  }

  // Video
  if (message.videoMessage) {
    return {
      id,
      jid,
      sender: key.participant || undefined,
      content: message.videoMessage.caption || "[Video]",
      content_type: "video",
      timestamp,
      is_from_me,
      status: "sent",
    }
  }

  // Audio
  if (message.audioMessage) {
    return {
      id,
      jid,
      sender: key.participant || undefined,
      content: "[Audio]",
      content_type: "audio",
      timestamp,
      is_from_me,
      status: "sent",
    }
  }

  // Document
  if (message.documentMessage) {
    return {
      id,
      jid,
      sender: key.participant || undefined,
      content: JSON.stringify({
        fileName: message.documentMessage.fileName,
        mimetype: message.documentMessage.mimetype,
      }),
      content_type: "document",
      timestamp,
      is_from_me,
      status: "sent",
    }
  }

  // Sticker
  if (message.stickerMessage) {
    return {
      id,
      jid,
      sender: key.participant || undefined,
      content: "[Sticker]",
      content_type: "sticker",
      timestamp,
      is_from_me,
      status: "sent",
    }
  }

  // Reaction
  if (message.reactionMessage) {
    return {
      id,
      jid,
      sender: key.participant || undefined,
      content: message.reactionMessage.text || "",
      content_type: "reaction",
      timestamp,
      is_from_me,
      status: "sent",
    }
  }

  // Fallback
  return {
    id,
    jid,
    sender: key.participant || undefined,
    content: "[Unsupported message]",
    content_type: "text",
    timestamp,
    is_from_me,
    status: "sent",
  }
}
