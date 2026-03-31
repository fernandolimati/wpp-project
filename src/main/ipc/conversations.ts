import { ipcMain } from 'electron'
import { conversationsRepo } from '../database/repositories/conversations'

export function setupConversationsIpc(): void {
  ipcMain.handle('conversations:getAll', async () => {
    return conversationsRepo.getAll()
  })

  ipcMain.handle('conversations:archive', async (_, id: string) => {
    conversationsRepo.archive(id)
  })

  ipcMain.handle('conversations:pin', async (_, { id, pinned }: { id: string; pinned: boolean }) => {
    conversationsRepo.pin(id, pinned)
  })

  ipcMain.handle(
    'conversations:mute',
    async (_, { id, until }: { id: string; until: number | null }) => {
      conversationsRepo.mute(id, until)
    }
  )

  ipcMain.handle('conversations:markUnread', async (_, id: string) => {
    conversationsRepo.markUnread(id)
  })
}
