import { registerDatabaseHandlers } from "./database"
import { registerWhatsAppHandlers } from "./whatsapp"
import { registerCloudHandlers } from "./cloud"

export function registerAllIpcHandlers(): void {
  registerDatabaseHandlers()
  registerWhatsAppHandlers()
  registerCloudHandlers()
}
