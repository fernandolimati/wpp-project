import { Notification, BrowserWindow } from "electron"

export function showMessageNotification(
  title: string,
  body: string,
  mainWindow: BrowserWindow | null,
  onClick?: () => void
): void {
  if (!Notification.isSupported()) return

  const notification = new Notification({
    title,
    body,
    silent: false,
  })

  notification.on("click", () => {
    mainWindow?.show()
    mainWindow?.focus()
    onClick?.()
  })

  notification.show()
}
