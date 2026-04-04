export interface Contact {
  id: string
  cloud_id?: string
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  company?: string
  lead_score: number
  preferences?: Record<string, unknown>
  whatsapp_jid?: string
  source?: "manual" | "whatsapp" | "csv" | "salesforce"
  archived?: boolean
  version: number
  updated_at: string
  created_at?: string
}

export interface Deal {
  id: string
  cloud_id?: string
  contact_id: string
  title: string
  stage: DealStage
  value: number
  expected_close?: string
  assigned_to?: string
  notes?: string
  version: number
  updated_at: string
  created_at?: string
}

export type DealStage =
  | "lead"
  | "qualified"
  | "sourcing"
  | "quoted"
  | "negotiation"
  | "booked"
  | "confirmed"
  | "completed"
  | "lost"

export interface WAMessage {
  id: string
  jid: string
  sender?: string
  content?: string
  content_type?: MessageContentType
  timestamp: number
  media_path?: string
  is_from_me: boolean
  status?: MessageStatus
  synced: boolean
}

export type MessageContentType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "sticker"
  | "reaction"

export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed"

export interface WAConversation {
  jid: string
  last_message?: string
  last_timestamp?: number
  unread_count: number
  pinned: boolean
}

export interface WAContact {
  jid: string
  name?: string
  phone?: string
  profile_pic_url?: string
}

export interface SyncQueueItem {
  id: number
  operation: "create" | "update" | "delete"
  table_name: string
  record_id: string
  record_version: number
  payload: Record<string, unknown>
  created_at: string
  status: "pending" | "synced" | "conflict" | "failed"
  retry_count?: number
}

export interface AppSettings {
  key: string
  value: string
}

export type WAConnectionState =
  | "disconnected"
  | "qr_code"
  | "pairing_code"
  | "connecting"
  | "connected"
  | "reconnecting"

export interface WAConnectionInfo {
  state: WAConnectionState
  jid?: string
  name?: string
  qrCode?: string
  pairingCode?: string
  reconnectAttempt?: number
  maxReconnectAttempts?: number
}

export interface QuoteLeg {
  from: string
  to: string
  date: string
  passengers: number
}

export interface QuoteLineItem {
  description: string
  type: "charter_fee" | "landing_fee" | "handling" | "catering" | "other"
  amount: number
}

export interface Quote {
  id: string
  deal_id: string
  legs: QuoteLeg[]
  line_items: QuoteLineItem[]
  tax_amount: number
  subtotal: number
  total: number
  valid_until?: string
  pdf_url?: string
  version: number
  updated_at: string
}
