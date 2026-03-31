import { Notification, BrowserWindow } from 'electron'
import { setTrayBadge } from './tray'
import type { Message } from '../../types/shared'

let totalUnread = 0

export function showMessageNotification(
  message: Message,
  senderName: string,
  win: BrowserWindow
): void {
  if (win.isFocused()) return

  totalUnread++
  setTrayBadge(totalUnread)

  try {
    const notification = new Notification({
      title: senderName,
      body: message.type === 'text' ? (message.content ?? '') : `📎 ${message.type}`,
      silent: false
    })

    notification.on('click', () => {
      win.show()
      win.focus()
      win.webContents.send('notification:clicked', {
        conversationId: message.conversationId
      })
    })

    notification.show()
  } catch {
    // Notifications may fail in development mode
  }
}

export function clearBadge(): void {
  totalUnread = 0
  setTrayBadge(0)
}
