interface Props {
  onClick: () => void
  position: 'bottom' | 'top'
  children: React.ReactNode
}

/**
 * Common styles for the floating indicators
 */
export function FloatingIndicator({ position, children, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`
        relative flex select-none items-center w-full gap-1 p-1 rounded-2xl cursor-pointer 
        ${position === 'top' ? 'translate-y[-33px]' : 'translate-y[33px]'}
       `}
      style={{
        animation: 'slideIn 340ms cubic-bezier(0.2, 0.9, 0.5, 1.16) forwards',
      }}>
      {children}
    </div>
  )
}
