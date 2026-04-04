import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron"
import { IPC_CHANNELS } from "@skydesk/shared"

type Callback = (...args: unknown[]) => void

const api = {
  wa: {
    init: () => ipcRenderer.invoke(IPC_CHANNELS.WA_INIT),
    logout: () => ipcRenderer.invoke(IPC_CHANNELS.WA_LOGOUT),
    sendMessage: (payload: { jid: string; text?: string }) =>
      ipcRenderer.invoke(IPC_CHANNELS.WA_SEND_MESSAGE, payload),
    getHistory: (payload: { jid: string; limit?: number; before?: number }) =>
      ipcRenderer.invoke(IPC_CHANNELS.WA_GET_HISTORY, payload),
    getContacts: () => ipcRenderer.invoke(IPC_CHANNELS.WA_GET_CONTACTS),
    requestPairing: (payload: { phoneNumber: string }) =>
      ipcRenderer.invoke(IPC_CHANNELS.WA_REQUEST_PAIRING, payload),
  },
  db: {
    contacts: {
      list: (payload?: { search?: string; limit?: number; offset?: number }) =>
        ipcRenderer.invoke(IPC_CHANNELS.DB_CONTACTS_LIST, payload),
      upsert: (payload: Record<string, unknown>) =>
        ipcRenderer.invoke(IPC_CHANNELS.DB_CONTACTS_UPSERT, payload),
    },
    deals: {
      list: (payload?: {
        contact_id?: string
        stage?: string
        limit?: number
        offset?: number
      }) => ipcRenderer.invoke(IPC_CHANNELS.DB_DEALS_LIST, payload),
      upsert: (payload: Record<string, unknown>) =>
        ipcRenderer.invoke(IPC_CHANNELS.DB_DEALS_UPSERT, payload),
    },
    messages: {
      list: (payload: { jid: string; limit?: number; before?: number }) =>
        ipcRenderer.invoke(IPC_CHANNELS.DB_MESSAGES_LIST, payload),
    },
    conversations: {
      list: () => ipcRenderer.invoke(IPC_CHANNELS.DB_CONVERSATIONS_LIST),
    },
    sync: {
      status: () => ipcRenderer.invoke(IPC_CHANNELS.DB_SYNC_STATUS),
    },
  },
  cloud: {
    auth: {
      login: (payload: { email: string; password: string }) =>
        ipcRenderer.invoke(IPC_CHANNELS.CLOUD_AUTH_LOGIN, payload),
      session: () => ipcRenderer.invoke(IPC_CHANNELS.CLOUD_AUTH_SESSION),
    },
    sync: {
      trigger: () => ipcRenderer.invoke(IPC_CHANNELS.CLOUD_SYNC_TRIGGER),
    },
    ai: {
      draft: (payload: Record<string, unknown>) =>
        ipcRenderer.invoke(IPC_CHANNELS.CLOUD_AI_DRAFT, payload),
      score: (payload: { contactId: string }) =>
        ipcRenderer.invoke(IPC_CHANNELS.CLOUD_AI_SCORE, payload),
    },
  },
  on: (channel: string, callback: Callback) => {
    const allowedChannels = Object.values(IPC_CHANNELS)
    if (allowedChannels.includes(channel as (typeof allowedChannels)[number])) {
      const listener = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args)
      ipcRenderer.on(channel, listener)
      return listener
    }
  },
  off: (channel: string, callback: Callback) => {
    ipcRenderer.removeListener(channel, callback as (...args: unknown[]) => void)
  },
}

contextBridge.exposeInMainWorld("skydesk", api)

export type SkyDeskAPI = typeof api
