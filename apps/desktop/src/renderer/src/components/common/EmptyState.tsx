interface EmptyStateProps {
  title: string
  description: string
  icon?: JSX.Element
}

export function EmptyState({ title, description, icon }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      {icon && <div className="mb-4 text-gray-300">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs">{description}</p>
    </div>
  )
}
