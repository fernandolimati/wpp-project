import { ipcMain } from "electron"
import { IPC_CHANNELS } from "@skydesk/shared"

export function registerCloudHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.CLOUD_AUTH_LOGIN, async (_event, _payload) => {
    // TODO: Implement Supabase auth
    return { success: false, error: "Not implemented" }
  })

  ipcMain.handle(IPC_CHANNELS.CLOUD_AUTH_SESSION, async () => {
    // TODO: Return current session
    return null
  })

  ipcMain.handle(IPC_CHANNELS.CLOUD_SYNC_TRIGGER, async () => {
    // TODO: Trigger sync engine
    return { success: false, error: "Not implemented" }
  })

  ipcMain.handle(IPC_CHANNELS.CLOUD_AI_DRAFT, async (_event, _payload) => {
    // TODO: Call AI draft via tRPC
    return { draft: "", error: "Not implemented" }
  })

  ipcMain.handle(IPC_CHANNELS.CLOUD_AI_SCORE, async (_event, _payload) => {
    // TODO: Call AI score via tRPC
    return { score: 0, error: "Not implemented" }
  })
}
