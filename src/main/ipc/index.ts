import { BrowserWindow } from 'electron'
import { setupWindowIpc } from './window'
import { setupMessagesIpc } from './messages'
import { setupConversationsIpc } from './conversations'
import { setupContactsIpc } from './contacts'
import { setupMediaIpc } from './media'
import { setupAuthIpc } from './auth'
import { setupSettingsIpc } from './settings'
import { setupGroupsIpc } from './groups'
import { setupTypingIpc } from './typing'
import { setupDashboardIpc } from './dashboard'

export function setupIpcHandlers(win: BrowserWindow): void {
  setupWindowIpc(win)
  setupMessagesIpc(win)
  setupConversationsIpc()
  setupContactsIpc()
  setupMediaIpc(win)
  setupAuthIpc(win)
  setupSettingsIpc()
  setupGroupsIpc()
  setupTypingIpc()
  setupDashboardIpc()
}
