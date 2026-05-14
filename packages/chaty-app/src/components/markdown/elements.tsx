import { ReactNode } from 'react'

const inlineCodeStyles = 'flex-shrink-0 px-1 py-px rounded-md text-[#c9d1d9] bg-[#0d1117] font-mono'

interface ParagraphProps {
  children?: ReactNode
  emojiSize?: 'small' | 'medium' | 'large'
  className?: string
}

export function paragraph({ children, emojiSize, className = '' }: ParagraphProps) {
  const emojiSizeClass =
    emojiSize === 'medium'
      ? '[--emoji-size:var(--emoji-size-medium)]'
      : emojiSize === 'large'
        ? '[--emoji-size:var(--emoji-size-large)]'
        : ''

  return <p className={`[&>code]:${inlineCodeStyles} ${emojiSizeClass} ${className}`}>{children}</p>
}

export function emphasis({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <em className={`italic ${className}`}> {children} </em>
}

export function strong({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <strong className={`font-bold ${className}`}> {children} </strong>
}

export function strikethrough({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <del className={`line-through ${className}`}> {children} </del>
}

export function heading1({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <h1 className={`text-2xl font-semibold ${className}`}> {children} </h1>
}

export function heading2({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <h2 className={`text-[1.6em] font-semibold ${className}`}> {children} </h2>
}

export function heading3({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <h3 className={`text-[1.4em] font-semibold ${className}`}> {children} </h3>
}

export function heading4({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <h4 className={`text-[1.2em] font-semibold ${className}`}> {children} </h4>
}

export function heading5({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <h5 className={`text-[1em] font-semibold ${className}`}> {children} </h5>
}

export function heading6({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <h6 className={`text-[0.8em] font-semibold ${className}`}> {children} </h6>
}

export function listItem({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <li className={className}> {children} </li>
}

export function unorderedList({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <ul className={`list-outside pl-6 [&_li]:list-disc [&_li_li]:list-circle ${className}`}>{children}</ul>
  )
}

interface OrderedListProps {
  children?: ReactNode
  start?: string | number
  className?: string
  style?: React.CSSProperties
}

export function orderedList({ children, start, className = '', style = {} }: OrderedListProps) {
  const startNumber = start ? parseInt(String(start), 10) - 1 : 0

  return (
    <ol
      className={`list-outside pl-6 list-none [counter-reset:list-counter_var(--start-number,0)] [&_li]:list-item [&_li]:[counter-increment:list-counter] [&_li::before]:content-['counter(list-counter)__"._"'] [&_li::before]:font-inherit ${className}`}
      style={{ '--start-number': startNumber, ...style } as React.CSSProperties}>
      {children}
    </ol>
  )
}

export function blockquote({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <blockquote
      className={`
        my-2 py-2 px-4 rounded-sm border-l-4
        [&_&_&]:text-(--md-sys-color-on-secondary-container) 
        [&_&_&]:bg-(--md-sys-color-secondary-container)
        [&_&_&]:[--border:var(--md-sys-color-secondary)]
        [&_&_&_&]:text-(--md-sys-color-on-tertiary-container)
        [&_&_&_&]:bg-(--md-sys-color-tertiary-container)
        [&_&_&_&]:[--border:var(--md-sys-color-tertiary)]
        [&_blockquote]:border-y [&_blockquote]:border-r
        ${className}
      `}
      style={{ '--border': 'var(--md-sys-color-secondary)' } as React.CSSProperties}>
      {children}
    </blockquote>
  )
}

export function table({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <table className={`border-collapse ${className}`}> {children} </table>
}

export function tableHeader({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <th className={`font-semibold p-2 border border-(--md-sys-color-outline) ${className}`}>{children}</th>
  )
}

export function tableElement({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <td className={`p-2 border border-(--md-sys-color-outline) ${className}`}>{children}</td>
}

export function code({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <code className={`font-mono ${className}`}> {children} </code>
}

export function time({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <time className={`${inlineCodeStyles} ${className}`}> {children} </time>
}

// Export all as a namespace for convenience
export const elements = {
  paragraph,
  emphasis,
  strong,
  strikethrough,
  heading1,
  heading2,
  heading3,
  heading4,
  heading5,
  heading6,
  listItem,
  unorderedList,
  orderedList,
  blockquote,
  table,
  tableHeader,
  tableElement,
  code,
  time,
}
