import { ReactNode } from 'react'

interface RenderCodeblockProps {
  children: ReactNode
  className?: string
}

/**
 * Render a code block with copy text button
 */
export function RenderCodeblock({ children, className = '' }: RenderCodeblockProps) {
  return (
    <pre
      className={`
        text-[#c9d1d9] bg-[#0d1117] w-fit p-4 my-2 rounded-md
        wrap-break-word whitespace-pre-wrap
        [&>code]:text-inherit [&>code]:bg-transparent!
        ${className}
      `}>
      {children}
    </pre>
  )
}
