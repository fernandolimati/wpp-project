import { z } from "zod"

// IPC Channel names
export const IPC_CHANNELS = {
  // WhatsApp
  WA_INIT: "wa:init",
  WA_LOGOUT: "wa:logout",
  WA_SEND_MESSAGE: "wa:message:send",
  WA_GET_HISTORY: "wa:message:history",
  WA_GET_CONTACTS: "wa:contacts:get",
  WA_REQUEST_PAIRING: "wa:pairing:request",

  // WhatsApp events (main → renderer)
  WA_QR: "wa:qr",
  WA_CONNECTED: "wa:connected",
  WA_RECONNECTING: "wa:reconnecting",
  WA_LOGGED_OUT: "wa:loggedout",
  WA_PAIRING_CODE: "wa:pairingCode",
  WA_MESSAGE_NEW: "wa:message:new",
  WA_MESSAGE_STATUS: "wa:message:status",
  WA_CONTACT_UPDATE: "wa:contact:update",
  WA_CONVERSATION_UPDATE: "wa:conversation:update",

  // Database
  DB_CONTACTS_LIST: "db:contacts:list",
  DB_CONTACTS_UPSERT: "db:contacts:upsert",
  DB_DEALS_LIST: "db:deals:list",
  DB_DEALS_UPSERT: "db:deals:upsert",
  DB_MESSAGES_LIST: "db:messages:list",
  DB_CONVERSATIONS_LIST: "db:conversations:list",
  DB_SYNC_STATUS: "db:sync:status",

  // Cloud
  CLOUD_AUTH_LOGIN: "cloud:auth:login",
  CLOUD_AUTH_SESSION: "cloud:auth:session",
  CLOUD_SYNC_TRIGGER: "cloud:sync:trigger",
  CLOUD_AI_DRAFT: "cloud:ai:draft",
  CLOUD_AI_SCORE: "cloud:ai:score",
} as const

// Zod schemas for IPC payloads

export const SendMessageSchema = z.object({
  jid: z.string(),
  text: z.string().optional(),
  media: z
    .object({
      path: z.string(),
      mimetype: z.string(),
      caption: z.string().optional(),
    })
    .optional(),
})
export type SendMessagePayload = z.infer<typeof SendMessageSchema>

export const MessageHistorySchema = z.object({
  jid: z.string(),
  limit: z.number().int().positive().default(50),
  before: z.number().optional(),
})
export type MessageHistoryPayload = z.infer<typeof MessageHistorySchema>

export const ContactUpsertSchema = z.object({
  id: z.string().optional(),
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  lead_score: z.number().int().min(0).max(100).optional(),
  preferences: z.record(z.unknown()).optional(),
  whatsapp_jid: z.string().optional(),
  source: z.enum(["manual", "whatsapp", "csv", "salesforce"]).optional(),
})
export type ContactUpsertPayload = z.infer<typeof ContactUpsertSchema>

export const DealUpsertSchema = z.object({
  id: z.string().optional(),
  contact_id: z.string(),
  title: z.string().min(1),
  stage: z.enum([
    "lead",
    "qualified",
    "sourcing",
    "quoted",
    "negotiation",
    "booked",
    "confirmed",
    "completed",
    "lost",
  ]),
  value: z.number().min(0),
  expected_close: z.string().optional(),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
})
export type DealUpsertPayload = z.infer<typeof DealUpsertSchema>

export const ContactsListSchema = z.object({
  search: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().min(0).default(0),
})
export type ContactsListPayload = z.infer<typeof ContactsListSchema>

export const DealsListSchema = z.object({
  contact_id: z.string().optional(),
  stage: z
    .enum([
      "lead",
      "qualified",
      "sourcing",
      "quoted",
      "negotiation",
      "booked",
      "confirmed",
      "completed",
      "lost",
    ])
    .optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().min(0).default(0),
})
export type DealsListPayload = z.infer<typeof DealsListSchema>

export const MessagesListSchema = z.object({
  jid: z.string(),
  limit: z.number().int().positive().default(50),
  before: z.number().optional(),
})
export type MessagesListPayload = z.infer<typeof MessagesListSchema>

export const CloudAuthLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
export type CloudAuthLoginPayload = z.infer<typeof CloudAuthLoginSchema>

export const AIDraftSchema = z.object({
  contactId: z.string(),
  conversationContext: z.array(
    z.object({
      content: z.string(),
      is_from_me: z.boolean(),
      timestamp: z.number(),
    })
  ),
  dealInfo: z.record(z.unknown()).optional(),
})
export type AIDraftPayload = z.infer<typeof AIDraftSchema>

export const AIScoreSchema = z.object({
  contactId: z.string(),
})
export type AIScorePayload = z.infer<typeof AIScoreSchema>

export const PairingRequestSchema = z.object({
  phoneNumber: z.string().min(10),
})
export type PairingRequestPayload = z.infer<typeof PairingRequestSchema>

export const CSVImportSchema = z.object({
  filePath: z.string(),
  columnMapping: z.record(z.string()),
})
export type CSVImportPayload = z.infer<typeof CSVImportSchema>
