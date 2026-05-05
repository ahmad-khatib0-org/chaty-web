import { ReactNode } from 'react'

interface Props {
  colour?: string | undefined
  children?: string | ReactNode
}

export function ColouredText({ colour, children }: Props) {
  // Check if colour includes "gradient"
  if (colour?.includes('gradient')) {
    return (
      <span style={{ background: colour }} className='bg-clip-text text-transparent no-underline'>
        {children}
      </span>
    )
  }

  // Fallback - regular colour
  return <span style={{ color: colour }}>{children}</span>
}
