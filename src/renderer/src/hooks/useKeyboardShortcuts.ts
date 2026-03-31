import { useEffect } from 'react'
import { useConversationsStore } from '../stores/conversationsStore'

export function useKeyboardShortcuts(): void {
  const { conversations, setActive } = useConversationsStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      // Ctrl/Cmd + K: focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('[data-search]')?.focus()
      }
      // Ctrl/Cmd + 1-9: go to conversation N
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        const idx = Number(e.key) - 1
        const conv = conversations[idx]
        if (conv) setActive(conv.id)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [conversations, setActive])
}
