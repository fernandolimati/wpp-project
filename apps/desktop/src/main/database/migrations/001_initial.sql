CREATE TABLE IF NOT EXISTS wa_auth (
  key TEXT PRIMARY KEY,
  value BLOB
);

CREATE TABLE IF NOT EXISTS wa_messages (
  id TEXT PRIMARY KEY,
  jid TEXT NOT NULL,
  sender TEXT,
  content TEXT,
  content_type TEXT DEFAULT 'text',
  timestamp INTEGER,
  media_path TEXT,
  is_from_me INTEGER DEFAULT 0,
  status TEXT DEFAULT 'sent',
  synced INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_wa_messages_jid ON wa_messages(jid);
CREATE INDEX IF NOT EXISTS idx_wa_messages_timestamp ON wa_messages(timestamp);

CREATE TABLE IF NOT EXISTS wa_contacts (
  jid TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  profile_pic_url TEXT
);

CREATE TABLE IF NOT EXISTS wa_conversations (
  jid TEXT PRIMARY KEY,
  last_message TEXT,
  last_timestamp INTEGER,
  unread_count INTEGER DEFAULT 0,
  pinned INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_wa_conversations_timestamp ON wa_conversations(last_timestamp);

CREATE TABLE IF NOT EXISTS local_contacts (
  id TEXT PRIMARY KEY,
  cloud_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  lead_score INTEGER DEFAULT 0,
  preferences JSON,
  whatsapp_jid TEXT,
  source TEXT DEFAULT 'manual',
  archived INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  updated_at TEXT,
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_local_contacts_phone ON local_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_local_contacts_whatsapp ON local_contacts(whatsapp_jid);

CREATE TABLE IF NOT EXISTS local_deals (
  id TEXT PRIMARY KEY,
  cloud_id TEXT,
  contact_id TEXT,
  title TEXT NOT NULL,
  stage TEXT DEFAULT 'lead',
  value REAL DEFAULT 0,
  expected_close TEXT,
  assigned_to TEXT,
  notes TEXT,
  version INTEGER DEFAULT 1,
  updated_at TEXT,
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_local_deals_contact ON local_deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_local_deals_stage ON local_deals(stage);

CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operation TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  record_version INTEGER DEFAULT 1,
  payload JSON,
  created_at TEXT,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- FTS5 for message search
CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
  content,
  jid UNINDEXED,
  content='wa_messages',
  content_rowid='rowid'
);
