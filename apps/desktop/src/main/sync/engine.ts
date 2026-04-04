import { createClient, type RealtimeChannel } from "@supabase/supabase-js"
import {
  getPendingSyncQueue,
  markSyncQueue,
  incrementSyncRetry,
  insertSyncQueue,
  upsertContact,
  upsertDeal,
  getSetting,
  setSetting,
} from "../database"
import { debounce } from "@skydesk/shared"

let supabase: ReturnType<typeof createClient> | null = null
let realtimeChannel: RealtimeChannel | null = null
let trpcClient: {
  sync: {
    push: { mutate: (input: Record<string, unknown>) => Promise<{ success: boolean; conflict: boolean }> }
    pullChanges: { query: (input: { since?: string }) => Promise<{
      contacts: Record<string, unknown>[]
      deals: Record<string, unknown>[]
      activities: Record<string, unknown>[]
      syncedAt: string
    }> }
  }
} | null = null

const MAX_RETRIES = 5

export function initSyncEngine(config: {
  supabaseUrl: string
  supabaseAnonKey: string
  accessToken: string
  tenantId: string
  trpc: typeof trpcClient
}): void {
  supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${config.accessToken}` } },
  })
  trpcClient = config.trpc

  // Startup delta pull
  startupPull()

  // Subscribe to Realtime changes
  subscribeToRealtime(config.tenantId)
}

async function startupPull(): Promise<void> {
  if (!trpcClient) return

  const lastSync = getSetting("last_sync_at")

  try {
    const { contacts, deals, syncedAt } = await trpcClient.sync.pullChanges.query({
      since: lastSync || undefined,
    })

    for (const contact of contacts) {
      applyRemoteChange("contacts", contact)
    }
    for (const deal of deals) {
      applyRemoteChange("deals", deal)
    }

    setSetting("last_sync_at", syncedAt)
  } catch (error) {
    console.error("Startup pull failed:", error)
  }
}

function subscribeToRealtime(tenantId: string): void {
  if (!supabase) return

  realtimeChannel = supabase
    .channel("tenant-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "contacts",
        filter: `tenant_id=eq.${tenantId}`,
      },
      (payload) => {
        if (payload.new) {
          applyRemoteChange("contacts", payload.new as Record<string, unknown>)
        }
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "deals",
        filter: `tenant_id=eq.${tenantId}`,
      },
      (payload) => {
        if (payload.new) {
          applyRemoteChange("deals", payload.new as Record<string, unknown>)
        }
      }
    )
    .subscribe()
}

function applyRemoteChange(table: string, record: Record<string, unknown>): void {
  if (table === "contacts") {
    upsertContact({
      id: record.id as string,
      cloud_id: record.id as string,
      first_name: record.first_name as string,
      last_name: record.last_name as string | undefined,
      email: record.email as string | undefined,
      phone: record.phone as string | undefined,
      company: record.company as string | undefined,
      lead_score: (record.lead_score as number) || 0,
      preferences: record.preferences as Record<string, unknown> | undefined,
      whatsapp_jid: record.whatsapp_jid as string | undefined,
      source: record.source as string | undefined,
      version: (record.version as number) || 1,
    })
  }

  if (table === "deals") {
    upsertDeal({
      id: record.id as string,
      cloud_id: record.id as string,
      contact_id: record.contact_id as string,
      title: record.title as string,
      stage: record.stage as string,
      value: (record.value as number) || 0,
      notes: record.notes as string | undefined,
      version: (record.version as number) || 1,
    })
  }
}

// Event-driven push: called after local writes via writeAndQueue
export const debouncedPush = debounce(processSyncQueue, 500)

async function processSyncQueue(): Promise<void> {
  if (!trpcClient) return

  const pending = getPendingSyncQueue() as Array<{
    id: number
    operation: string
    table_name: string
    record_id: string
    record_version: number
    payload: string
    retry_count: number
  }>

  for (const item of pending) {
    if (item.retry_count >= MAX_RETRIES) {
      markSyncQueue(item.id, "failed")
      continue
    }

    try {
      const payload = typeof item.payload === "string" ? JSON.parse(item.payload) : item.payload

      const result = await trpcClient.sync.push.mutate({
        operation: item.operation,
        table: item.table_name,
        recordId: item.record_id,
        version: item.record_version,
        payload,
      })

      if (result.conflict) {
        markSyncQueue(item.id, "conflict")
      } else {
        markSyncQueue(item.id, "synced")
      }
    } catch {
      incrementSyncRetry(item.id)
    }
  }
}

// Write helper: local write + sync queue + debounced push
export function writeAndQueue(
  operation: "create" | "update" | "delete",
  tableName: string,
  recordId: string,
  recordVersion: number,
  payload: Record<string, unknown>
): void {
  // Local write handled by caller (upsertContact/upsertDeal)

  insertSyncQueue({
    operation,
    table_name: tableName,
    record_id: recordId,
    record_version: recordVersion,
    payload,
  })

  debouncedPush()
}

export function stopSyncEngine(): void {
  if (realtimeChannel) {
    supabase?.removeChannel(realtimeChannel)
    realtimeChannel = null
  }
  supabase = null
  trpcClient = null
}
