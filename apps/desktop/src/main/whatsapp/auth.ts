import type { AuthenticationState, SignalDataTypeMap } from "@whiskeysockets/baileys"
import { proto } from "@whiskeysockets/baileys"
import { initAuthCreds } from "@whiskeysockets/baileys"
import * as db from "../database"

const KEY_PREFIX = "auth:"

function bufferToJSON(obj: unknown): unknown {
  if (Buffer.isBuffer(obj)) {
    return { type: "Buffer", data: Array.from(obj) }
  }
  if (obj && typeof obj === "object") {
    if (Array.isArray(obj)) return obj.map(bufferToJSON)
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = bufferToJSON(value)
    }
    return result
  }
  return obj
}

function jsonToBuffer(obj: unknown): unknown {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const record = obj as Record<string, unknown>
    if (record.type === "Buffer" && Array.isArray(record.data)) {
      return Buffer.from(record.data as number[])
    }
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(record)) {
      result[key] = jsonToBuffer(value)
    }
    return result
  }
  if (Array.isArray(obj)) return obj.map(jsonToBuffer)
  return obj
}

export async function loadAuthFromSQLite(
  sessionId: string
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
  const prefix = `${KEY_PREFIX}${sessionId}:`

  const credsData = db.getAuthKey(`${prefix}creds`)
  let creds = credsData
    ? (jsonToBuffer(JSON.parse(credsData.toString("utf-8"))) as AuthenticationState["creds"])
    : initAuthCreds()

  const state: AuthenticationState = {
    creds,
    keys: {
      get: (type: keyof SignalDataTypeMap, ids: string[]) => {
        const data: Record<string, SignalDataTypeMap[keyof SignalDataTypeMap]> = {}
        for (const id of ids) {
          const raw = db.getAuthKey(`${prefix}${type}-${id}`)
          if (raw) {
            let parsed = jsonToBuffer(JSON.parse(raw.toString("utf-8")))
            if (type === "app-state-sync-key") {
              parsed = proto.Message.AppStateSyncKeyData.fromObject(
                parsed as Record<string, unknown>
              )
            }
            data[id] = parsed as SignalDataTypeMap[keyof SignalDataTypeMap]
          }
        }
        return data
      },
      set: (data: Record<string, Record<string, unknown>>) => {
        for (const [type, entries] of Object.entries(data)) {
          for (const [id, value] of Object.entries(entries)) {
            const key = `${prefix}${type}-${id}`
            if (value) {
              db.setAuthKey(key, Buffer.from(JSON.stringify(bufferToJSON(value)), "utf-8"))
            } else {
              db.deleteAuthKey(key)
            }
          }
        }
      },
    },
  }

  const saveCreds = async (): Promise<void> => {
    creds = state.creds
    db.setAuthKey(`${prefix}creds`, Buffer.from(JSON.stringify(bufferToJSON(creds)), "utf-8"))
  }

  return { state, saveCreds }
}
