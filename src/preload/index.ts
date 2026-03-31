import { contextBridge, ipcRenderer } from 'electron'
import type { Message, Conversation, Contact, TypingIndicator } from '../types/shared'

// ─── Types for exposed APIs ─────────────────────────────────────────────
export interface ElectronAPI {
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
    quit: () => void
    onMaximized: (cb: (isMaximized: boolean) => void) => () => void
  }
  messages: {
    send: (payload: Omit<Message, 'id' | 'timestamp' | 'status'>) => Promise<Message>
    getHistory: (conversationId: string, limit: number, before?: number) => Promise<Message[]>
    markAsRead: (messageIds: string[]) => Promise<void>
    edit: (messageId: string, newContent: string) => Promise<void>
    delete: (messageId: string) => Promise<void>
    onNew: (cb: (message: Message) => void) => () => void
    onStatusUpdate: (cb: (update: { id: string; status: Message['status'] }) => void) => () => void
    onEdited: (cb: (data: { messageId: string; newContent: string; editedAt: number }) => void) => () => void
  }
  conversations: {
    getAll: () => Promise<Conversation[]>
    archive: (id: string) => Promise<void>
    pin: (id: string, pinned: boolean) => Promise<void>
    mute: (id: string, until: number | null) => Promise<void>
    markUnread: (id: string) => Promise<void>
    onUpdate: (cb: (conv: Conversation) => void) => () => void
  }
  contacts: {
    getAll: () => Promise<Contact[]>
    onPresenceUpdate: (cb: (update: { contactId: string; status: Contact['status'] }) => void) => () => void
  }
  typing: {
    sendStart: (conversationId: string) => void
    sendStop: (conversationId: string) => void
    onIndicator: (cb: (indicator: TypingIndicator) => void) => () => void
  }
  media: {
    selectFiles: (options?: { accept?: string[] }) => Promise<string[]>
    uploadFile: (filePath: string, conversationId: string) => Promise<string>
    getLocalUrl: (mediaId: string) => Promise<string>
  }
  auth: {
    login: (username: string, password: string) => Promise<{ success: boolean; token?: string; error?: string }>
    logout: () => Promise<void>
    getSession: () => Promise<{ userId: string; username: string } | null>
  }
  settings: {
    get: <T>(key: string) => Promise<T>
    set: (key: string, value: unknown) => Promise<void>
  }
  search: {
    messages: (query: string, limit?: number) => Promise<(Message & { highlighted_content?: string })[]>
  }
  groups: {
    create: (name: string, memberIds: string[]) => Promise<string>
  }
  socket: {
    onConnected: (cb: () => void) => () => void
    onDisconnected: (cb: (reason: string) => void) => () => void
  }
  updater: {
    onAvailable: (cb: (info: { version: string }) => void) => () => void
    onProgress: (cb: (info: { percent: number }) => void) => () => void
    onDownloaded: (cb: (info: { version: string }) => void) => () => void
  }
  deeplink: {
    onOpenChat: (cb: (data: { contactId: string }) => void) => () => void
  }
  notification: {
    onClicked: (cb: (data: { conversationId: string }) => void) => () => void
  }
}

// ─── Helper: register IPC listener and return cleanup function ──────────
function onIpc<T>(channel: string, cb: (data: T) => void): () => void {
  const handler = (_: Electron.IpcRendererEvent, data: T): void => cb(data)
  ipcRenderer.on(channel, handler)
  return () => ipcRenderer.removeListener(channel, handler)
}

// ─── Expose via contextBridge ─────────────────────────────────────────────
const api: ElectronAPI = {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    quit: () => ipcRenderer.send('window:quit'),
    onMaximized: (cb) => onIpc('window:maximized', cb)
  },
  messages: {
    send: (payload) => ipcRenderer.invoke('messages:send', payload),
    getHistory: (conversationId, limit, before) =>
      ipcRenderer.invoke('messages:getHistory', { conversationId, limit, before }),
    markAsRead: (messageIds) => ipcRenderer.invoke('messages:markAsRead', messageIds),
    edit: (messageId, newContent) => ipcRenderer.invoke('messages:edit', { messageId, newContent }),
    delete: (messageId) => ipcRenderer.invoke('messages:delete', messageId),
    onNew: (cb) => onIpc('messages:new', cb),
    onStatusUpdate: (cb) => onIpc('messages:statusUpdate', cb),
    onEdited: (cb) => onIpc('messages:edited', cb)
  },
  conversations: {
    getAll: () => ipcRenderer.invoke('conversations:getAll'),
    archive: (id) => ipcRenderer.invoke('conversations:archive', id),
    pin: (id, pinned) => ipcRenderer.invoke('conversations:pin', { id, pinned }),
    mute: (id, until) => ipcRenderer.invoke('conversations:mute', { id, until }),
    markUnread: (id) => ipcRenderer.invoke('conversations:markUnread', id),
    onUpdate: (cb) => onIpc('conversations:update', cb)
  },
  contacts: {
    getAll: () => ipcRenderer.invoke('contacts:getAll'),
    onPresenceUpdate: (cb) => onIpc('contacts:presenceUpdate', cb)
  },
  typing: {
    sendStart: (conversationId) => ipcRenderer.send('typing:start', conversationId),
    sendStop: (conversationId) => ipcRenderer.send('typing:stop', conversationId),
    onIndicator: (cb) => onIpc('typing:indicator', cb)
  },
  media: {
    selectFiles: (options) => ipcRenderer.invoke('media:selectFiles', options),
    uploadFile: (filePath, conversationId) =>
      ipcRenderer.invoke('media:uploadFile', { filePath, conversationId }),
    getLocalUrl: (mediaId) => ipcRenderer.invoke('media:getLocalUrl', mediaId)
  },
  auth: {
    login: (username, password) => ipcRenderer.invoke('auth:login', { username, password }),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getSession: () => ipcRenderer.invoke('auth:getSession')
  },
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', { key, value })
  },
  search: {
    messages: (query, limit) => ipcRenderer.invoke('search:messages', { query, limit })
  },
  groups: {
    create: (name, memberIds) => ipcRenderer.invoke('groups:create', { name, memberIds })
  },
  socket: {
    onConnected: (cb) => onIpc('socket:connected', cb),
    onDisconnected: (cb) => onIpc('socket:disconnected', cb)
  },
  updater: {
    onAvailable: (cb) => onIpc('updater:available', cb),
    onProgress: (cb) => onIpc('updater:progress', cb),
    onDownloaded: (cb) => onIpc('updater:downloaded', cb)
  },
  deeplink: {
    onOpenChat: (cb) => onIpc('deeplink:openChat', cb)
  },
  notification: {
    onClicked: (cb) => onIpc('notification:clicked', cb)
  }
}

contextBridge.exposeInMainWorld('api', api)
