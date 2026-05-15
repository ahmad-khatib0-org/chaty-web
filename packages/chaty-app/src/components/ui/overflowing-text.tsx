import { ReactNode } from 'react'

export function OverflowingText({ children }: { children: ReactNode }) {
  return (
    <div className='overflow-hidden whitespace-nowrap text-ellipsis *:overflow-hidden *:whitespace-nowrap *:text-ellipsis'>
      {children}
    </div>
  )
}

/**
 * Break all text and prevent overflow from math blocks
 */
export function BreakText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`wrap-break-word [&_.math]:overflow-x-auto [&_.math]:overflow-y-hidden [&_.math]:max-h-screen ${className}`}>
      {children}
    </div>
  )
}
