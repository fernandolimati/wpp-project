import { Tray, Menu, app, BrowserWindow, nativeImage } from "electron"

let tray: Tray | null = null

export function createTray(mainWindow: BrowserWindow): void {
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open SkyDesk",
      click: () => mainWindow.show(),
    },
    {
      label: "New Message",
      click: () => {
        mainWindow.show()
        mainWindow.webContents.send("action:new-message")
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        ;(app as typeof app & { isQuitting: boolean }).isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setToolTip("SkyDesk CRM")
  tray.setContextMenu(contextMenu)

  tray.on("click", () => {
    mainWindow.show()
  })
}

export function updateTrayBadge(count: number): void {
  if (!tray) return
  tray.setToolTip(count > 0 ? `SkyDesk CRM (${count} unread)` : "SkyDesk CRM")
  if (process.platform === "darwin") {
    app.setBadgeCount(count)
  }
}
