import { ReactNode } from 'react'

export function OverflowingText({ children }: { children: ReactNode }) {
  return (
    <div className='overflow-hidden whitespace-nowrap text-ellipsis *:overflow-hidden *:whitespace-nowrap *:text-ellipsis'>
      {children}
    </div>
  )
}
