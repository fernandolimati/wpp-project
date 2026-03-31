import { memo } from 'react'
import type { Message } from '../../../../types/shared'

interface Props {
  status: Message['status']
}

export const MessageStatus = memo(function MessageStatus({ status }: Props) {
  if (status === 'sending') {
    return <span className="text-gray-400 text-xs">&#8987;</span>
  }
  if (status === 'failed') {
    return <span className="text-red-500 text-xs font-bold">!</span>
  }

  const color = status === 'read' ? '#53bdeb' : '#8696a0'

  if (status === 'sent') {
    return (
      <svg width="14" height="11" viewBox="0 0 14 11" fill={color}>
        <path d="M11.07.47 4.35 7.2l-1.63-1.63L1.3 7l3.05 3.05L12.5 1.9 11.07.47z" />
      </svg>
    )
  }

  // delivered or read: double ticks
  return (
    <svg width="18" height="11" viewBox="0 0 18 11" fill={color}>
      <path d="M17.35.47 9.42 8.4 7.59 6.57 6.17 8l3.25 3.25L18.77 1.9 17.35.47zm-5.3 0L5.33 7.2 3.7 5.57 2.27 7 5.33 10.05 13.48 1.9 12.06.47z" />
    </svg>
  )
})
