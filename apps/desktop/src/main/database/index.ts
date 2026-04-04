import Database from "better-sqlite3"
import { app } from "electron"
import { join } from "path"
import { readFileSync } from "fs"

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) throw new Error("Database not initialized")
  return db
}

export function initDatabase(): void {
  const dbPath = join(app.getPath("userData"), "skydesk.db")
  db = new Database(dbPath)

  db.pragma("journal_mode = WAL")
  db.pragma("foreign_keys = ON")
  db.pragma("busy_timeout = 5000")

  runMigrations()
}

function runMigrations(): void {
  const database = getDb()

  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `)

  const applied = new Set(
    database
      .prepare("SELECT name FROM _migrations")
      .all()
      .map((row) => (row as { name: string }).name)
  )

  const migrationsDir = join(__dirname, "../../src/main/database/migrations")
  const migrations = ["001_initial.sql"]

  for (const migration of migrations) {
    if (applied.has(migration)) continue

    const sql = readFileSync(join(migrationsDir, migration), "utf-8")
    database.exec(sql)
    database.prepare("INSERT INTO _migrations (name) VALUES (?)").run(migration)
  }
}

// --- Contact queries ---

export function listContacts(params?: {
  search?: string
  limit?: number
  offset?: number
}): unknown[] {
  const { search, limit = 50, offset = 0 } = params || {}
  const database = getDb()

  if (search) {
    return database
      .prepare(
        `SELECT * FROM local_contacts
         WHERE archived = 0 AND (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR company LIKE ?)
         ORDER BY updated_at DESC LIMIT ? OFFSET ?`
      )
      .all(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, limit, offset)
  }

  return database
    .prepare(
      "SELECT * FROM local_contacts WHERE archived = 0 ORDER BY updated_at DESC LIMIT ? OFFSET ?"
    )
    .all(limit, offset)
}

export function upsertContact(contact: Record<string, unknown>): void {
  const database = getDb()
  const id = (contact.id as string) || crypto.randomUUID()
  const now = new Date().toISOString()

  database
    .prepare(
      `INSERT INTO local_contacts (id, first_name, last_name, email, phone, company, lead_score, preferences, whatsapp_jid, source, version, updated_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         first_name = excluded.first_name,
         last_name = excluded.last_name,
         email = excluded.email,
         phone = excluded.phone,
         company = excluded.company,
         lead_score = COALESCE(excluded.lead_score, local_contacts.lead_score),
         preferences = COALESCE(excluded.preferences, local_contacts.preferences),
         whatsapp_jid = COALESCE(excluded.whatsapp_jid, local_contacts.whatsapp_jid),
         source = COALESCE(excluded.source, local_contacts.source),
         version = local_contacts.version + 1,
         updated_at = excluded.updated_at`
    )
    .run(
      id,
      contact.first_name,
      contact.last_name || null,
      contact.email || null,
      contact.phone || null,
      contact.company || null,
      contact.lead_score || 0,
      contact.preferences ? JSON.stringify(contact.preferences) : null,
      contact.whatsapp_jid || null,
      contact.source || "manual",
      now,
      now
    )
}

// --- Deal queries ---

export function listDeals(params?: {
  contact_id?: string
  stage?: string
  limit?: number
  offset?: number
}): unknown[] {
  const { contact_id, stage, limit = 50, offset = 0 } = params || {}
  const database = getDb()

  let sql = "SELECT * FROM local_deals WHERE 1=1"
  const bindings: unknown[] = []

  if (contact_id) {
    sql += " AND contact_id = ?"
    bindings.push(contact_id)
  }
  if (stage) {
    sql += " AND stage = ?"
    bindings.push(stage)
  }

  sql += " ORDER BY updated_at DESC LIMIT ? OFFSET ?"
  bindings.push(limit, offset)

  return database.prepare(sql).all(...bindings)
}

export function upsertDeal(deal: Record<string, unknown>): void {
  const database = getDb()
  const id = (deal.id as string) || crypto.randomUUID()
  const now = new Date().toISOString()

  database
    .prepare(
      `INSERT INTO local_deals (id, contact_id, title, stage, value, expected_close, assigned_to, notes, version, updated_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         contact_id = excluded.contact_id,
         title = excluded.title,
         stage = excluded.stage,
         value = excluded.value,
         expected_close = excluded.expected_close,
         assigned_to = excluded.assigned_to,
         notes = excluded.notes,
         version = local_deals.version + 1,
         updated_at = excluded.updated_at`
    )
    .run(
      id,
      deal.contact_id,
      deal.title,
      deal.stage || "lead",
      deal.value || 0,
      deal.expected_close || null,
      deal.assigned_to || null,
      deal.notes || null,
      now,
      now
    )
}

// --- Message queries ---

export function listMessages(params: {
  jid: string
  limit?: number
  before?: number
}): unknown[] {
  const { jid, limit = 50, before } = params
  const database = getDb()

  if (before) {
    return database
      .prepare(
        "SELECT * FROM wa_messages WHERE jid = ? AND timestamp < ? ORDER BY timestamp DESC LIMIT ?"
      )
      .all(jid, before, limit)
  }

  return database
    .prepare(
      "SELECT * FROM wa_messages WHERE jid = ? ORDER BY timestamp DESC LIMIT ?"
    )
    .all(jid, limit)
}

export function upsertMessage(msg: Record<string, unknown>): void {
  const database = getDb()
  database
    .prepare(
      `INSERT INTO wa_messages (id, jid, sender, content, content_type, timestamp, media_path, is_from_me, status, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
       ON CONFLICT(id) DO UPDATE SET
         content = COALESCE(excluded.content, wa_messages.content),
         media_path = COALESCE(excluded.media_path, wa_messages.media_path),
         status = COALESCE(excluded.status, wa_messages.status)`
    )
    .run(
      msg.id,
      msg.jid,
      msg.sender || null,
      msg.content || null,
      msg.content_type || "text",
      msg.timestamp,
      msg.media_path || null,
      msg.is_from_me ? 1 : 0,
      msg.status || "sent"
    )
}

// --- Conversation queries ---

export function listConversations(): unknown[] {
  const database = getDb()
  return database
    .prepare(
      `SELECT c.*, wc.name, wc.profile_pic_url
       FROM wa_conversations c
       LEFT JOIN wa_contacts wc ON c.jid = wc.jid
       ORDER BY c.pinned DESC, c.last_timestamp DESC`
    )
    .all()
}

export function updateConversation(jid: string, data: Record<string, unknown>): void {
  const database = getDb()
  database
    .prepare(
      `INSERT INTO wa_conversations (jid, last_message, last_timestamp, unread_count, pinned)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(jid) DO UPDATE SET
         last_message = COALESCE(excluded.last_message, wa_conversations.last_message),
         last_timestamp = COALESCE(excluded.last_timestamp, wa_conversations.last_timestamp),
         unread_count = COALESCE(excluded.unread_count, wa_conversations.unread_count),
         pinned = COALESCE(excluded.pinned, wa_conversations.pinned)`
    )
    .run(
      jid,
      data.last_message || null,
      data.last_timestamp || null,
      data.unread_count ?? 0,
      data.pinned ? 1 : 0
    )
}

// --- WA Auth queries ---

export function getAuthKey(key: string): Buffer | null {
  const database = getDb()
  const row = database
    .prepare("SELECT value FROM wa_auth WHERE key = ?")
    .get(key) as { value: Buffer } | undefined
  return row?.value ?? null
}

export function setAuthKey(key: string, value: Buffer): void {
  const database = getDb()
  database
    .prepare("INSERT INTO wa_auth (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(key, value)
}

export function deleteAuthKey(key: string): void {
  const database = getDb()
  database.prepare("DELETE FROM wa_auth WHERE key = ?").run(key)
}

export function clearAuth(): void {
  const database = getDb()
  database.prepare("DELETE FROM wa_auth").run()
}

// --- WA Contacts ---

export function upsertWAContact(contact: {
  jid: string
  name?: string
  phone?: string
  profile_pic_url?: string
}): void {
  const database = getDb()
  database
    .prepare(
      `INSERT INTO wa_contacts (jid, name, phone, profile_pic_url)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(jid) DO UPDATE SET
         name = COALESCE(excluded.name, wa_contacts.name),
         phone = COALESCE(excluded.phone, wa_contacts.phone),
         profile_pic_url = COALESCE(excluded.profile_pic_url, wa_contacts.profile_pic_url)`
    )
    .run(contact.jid, contact.name || null, contact.phone || null, contact.profile_pic_url || null)
}

export function getWAContacts(): unknown[] {
  const database = getDb()
  return database.prepare("SELECT * FROM wa_contacts ORDER BY name").all()
}

// --- Sync Queue ---

export function insertSyncQueue(item: {
  operation: string
  table_name: string
  record_id: string
  record_version: number
  payload: Record<string, unknown>
}): void {
  const database = getDb()
  database
    .prepare(
      `INSERT INTO sync_queue (operation, table_name, record_id, record_version, payload, created_at, status)
       VALUES (?, ?, ?, ?, ?, datetime('now'), 'pending')`
    )
    .run(
      item.operation,
      item.table_name,
      item.record_id,
      item.record_version,
      JSON.stringify(item.payload)
    )
}

export function getPendingSyncQueue(): unknown[] {
  const database = getDb()
  return database
    .prepare("SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY id ASC")
    .all()
}

export function markSyncQueue(id: number, status: string): void {
  const database = getDb()
  database.prepare("UPDATE sync_queue SET status = ? WHERE id = ?").run(status, id)
}

export function incrementSyncRetry(id: number): void {
  const database = getDb()
  database
    .prepare("UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?")
    .run(id)
}

// --- App Settings ---

export function getSetting(key: string): string | null {
  const database = getDb()
  const row = database.prepare("SELECT value FROM app_settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined
  return row?.value ?? null
}

export function setSetting(key: string, value: string): void {
  const database = getDb()
  database
    .prepare(
      "INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(key, value)
}
