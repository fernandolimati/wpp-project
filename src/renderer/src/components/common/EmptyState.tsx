import { MessageSquare } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-wp-header border-l border-wp-border">
      <div className="flex flex-col items-center gap-6 max-w-md text-center px-8">
        <div className="w-[260px] h-[260px] flex items-center justify-center">
          <MessageSquare className="w-32 h-32 text-wp-text-secondary/30" strokeWidth={1} />
        </div>
        <h1 className="text-3xl font-light text-wp-text-primary">WPP para Desktop</h1>
        <p className="text-sm text-wp-text-secondary leading-relaxed">
          Envie e receba mensagens. Selecione uma conversa ao lado para começar.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-wp-text-secondary">
          <span className="inline-block w-1.5 h-1.5 bg-wp-green rounded-full" />
          Criptografia de ponta a ponta
        </div>
      </div>
    </div>
  )
}
