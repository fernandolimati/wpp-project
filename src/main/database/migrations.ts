import type Database from 'better-sqlite3'

interface Migration {
  version: number
  up: (db: Database.Database) => void
}

const migrations: Migration[] = [
  {
    version: 1,
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS contacts (
          id          TEXT PRIMARY KEY,
          name        TEXT NOT NULL,
          avatar_url  TEXT,
          status      TEXT DEFAULT 'offline',
          last_seen   INTEGER,
          phone       TEXT,
          created_at  INTEGER DEFAULT (unixepoch())
        );

        CREATE TABLE IF NOT EXISTS conversations (
          id              TEXT PRIMARY KEY,
          contact_id      TEXT,
          is_group        INTEGER DEFAULT 0,
          name            TEXT,
          icon_url        TEXT,
          last_message_at INTEGER DEFAULT 0,
          unread_count    INTEGER DEFAULT 0,
          is_pinned       INTEGER DEFAULT 0,
          is_archived     INTEGER DEFAULT 0,
          is_muted        INTEGER DEFAULT 0,
          mute_until      INTEGER,
          created_at      INTEGER DEFAULT (unixepoch()),
          FOREIGN KEY (contact_id) REFERENCES contacts(id)
        );

        CREATE TABLE IF NOT EXISTS messages (
          id              TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          sender_id       TEXT NOT NULL,
          content         TEXT,
          type            TEXT DEFAULT 'text',
          status          TEXT DEFAULT 'sent',
          timestamp       INTEGER DEFAULT (unixepoch() * 1000),
          reply_to_id     TEXT,
          edited_at       INTEGER,
          deleted_at      INTEGER,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id),
          FOREIGN KEY (reply_to_id) REFERENCES messages(id)
        );

        CREATE TABLE IF NOT EXISTS media (
          id          TEXT PRIMARY KEY,
          message_id  TEXT NOT NULL,
          local_path  TEXT,
          remote_url  TEXT,
          mime_type   TEXT,
          size        INTEGER,
          width       INTEGER,
          height      INTEGER,
          duration    INTEGER,
          thumbnail   TEXT,
          FOREIGN KEY (message_id) REFERENCES messages(id)
        );

        CREATE TABLE IF NOT EXISTS group_members (
          group_id    TEXT NOT NULL,
          user_id     TEXT NOT NULL,
          role        TEXT DEFAULT 'member',
          joined_at   INTEGER DEFAULT (unixepoch()),
          PRIMARY KEY (group_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS message_reactions (
          message_id  TEXT NOT NULL,
          user_id     TEXT NOT NULL,
          emoji       TEXT NOT NULL,
          created_at  INTEGER DEFAULT (unixepoch()),
          PRIMARY KEY (message_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS webhook_queue (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          payload     TEXT NOT NULL,
          status      TEXT DEFAULT 'pending',
          attempts    INTEGER DEFAULT 0,
          created_at  INTEGER DEFAULT (unixepoch()),
          processed_at INTEGER
        );

        CREATE INDEX IF NOT EXISTS idx_messages_conversation
          ON messages(conversation_id, timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_conversations_pinned_time
          ON conversations(is_pinned DESC, last_message_at DESC);
        CREATE INDEX IF NOT EXISTS idx_messages_content
          ON messages(content);
      `)
    }
  },
  {
    version: 2,
    up: (db) => {
      db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
          content,
          conversation_id UNINDEXED,
          message_id UNINDEXED,
          content='messages',
          content_rowid='rowid'
        );

        CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
          INSERT INTO messages_fts(rowid, content, conversation_id, message_id)
          VALUES (new.rowid, new.content, new.conversation_id, new.id);
        END;
      `)
    }
  }
]

export function runMigrations(db: Database.Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL DEFAULT 0)`)

  const row = db.prepare('SELECT version FROM schema_version LIMIT 1').get() as
    | { version: number }
    | undefined
  let currentVersion: number

  if (!row) {
    db.prepare('INSERT INTO schema_version VALUES (0)').run()
    currentVersion = 0
  } else {
    currentVersion = row.version
  }

  const pending = migrations.filter((m) => m.version > currentVersion)
  if (pending.length === 0) return

  const runAll = db.transaction(() => {
    for (const migration of pending) {
      console.log(`Running migration v${migration.version}...`)
      migration.up(db)
      db.prepare('UPDATE schema_version SET version = ?').run(migration.version)
    }
  })

  runAll()
  console.log(`Database migrated to version ${pending.at(-1)?.version}`)
}
