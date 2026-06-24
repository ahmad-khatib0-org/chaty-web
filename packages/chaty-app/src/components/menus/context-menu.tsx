import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { autoUpdate, offset, shift, useFloating } from '@floating-ui/react'
import { IconChevronRight } from '@tabler/icons-react'

interface ContextMenuProps {
  children: ReactNode
  className?: string
}

export function ContextMenu({ children, className = '' }: ContextMenuProps) {
  return (
    <div
      className={`flex flex-col py-3 overflow-hidden rounded-2xl bg-(--md-sys-color-surface-container) text-(--md-sys-color-on-surface) fill-(--md-sys-color-on-surface) shadow-[0_0_3px_var(--md-sys-color-shadow)] select-none ${className}`}
      onMouseDown={(e) => e.stopPropagation()}>
      {children}
    </div>
  )
}

export function ContextMenuDivider() {
  return <div className='h-px my-2 bg-(--md-sys-color-outline-variant)' />
}

interface ContextMenuItemProps {
  children: ReactNode
  ref?: React.Dispatch<React.SetStateAction<HTMLElement | null>>
  onClick?: (e: React.MouseEvent) => void
  selected?: boolean
  destructive?: boolean
  className?: string
  icon?: React.ComponentType<{ size: number }>
  symbol?: React.ComponentType<{ size: number }>
  actionIcon?: React.ComponentType<{ size: number }>
  actionSymbol?: React.ComponentType<{ size: number }>
  onMouseEnter?: (e: React.MouseEvent) => void
}

export function ContextMenuItem({
  children,
  onClick,
  selected,
  destructive,
  actionSymbol: ActionSymbol,
  className,
  actionIcon: ActionIcon,
  symbol: Symbol,
  icon: Icon,
  ref,
}: ContextMenuItemProps) {
  const baseClasses =
    'flex gap-4 items-center px-4 py-3 cursor-pointer hover:bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,transparent)]'
  const selectedClasses = selected
    ? 'bg-[color-mix(in_srgb,var(--md-sys-color-on-surface)_8%,transparent)]'
    : ''
  const destructiveClasses = destructive
    ? 'fill-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)]'
    : ''

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${selectedClasses} ${destructiveClasses} ${className}`}
      onClick={onClick}>
      {Icon && <Icon size={16} />}
      {Symbol && <Symbol size={16} />}
      <span className='grow'>{children}</span>
      {ActionIcon && <ActionIcon size={20} />}
      {ActionSymbol && <ActionSymbol size={20} />}
    </div>
  )
}

interface ContextMenuButtonProps extends Omit<ContextMenuItemProps, 'children'> {
  children: ReactNode
  ref?: React.Dispatch<React.SetStateAction<HTMLElement | null>>
}

export function ContextMenuButton({ ref, ...props }: ContextMenuButtonProps) {
  return <ContextMenuItem ref={ref} {...props} />
}

interface ContextMenuSubMenuProps {
  children: ReactNode
  buttonContent: ReactNode
  onClick?: () => void
  icon?: React.ComponentType<{ size: number }>
  symbol?: React.ComponentType<{ size: number }>
  destructive?: boolean
}

export function ContextMenuSubMenu({
  children,
  buttonContent,
  onClick,
  icon,
  symbol,
  destructive,
}: ContextMenuSubMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [floating, setFloating] = useState<HTMLDivElement | null>(null)
  const [show, setShow] = useState<'hide' | 'show' | boolean>(false)

  const isShowing = show === true || show === 'show'

  const { x, y, strategy, refs } = useFloating({
    open: isShowing,
    onOpenChange: () => { },
    placement: 'right-start',
    middleware: [offset(5), shift()],
    whileElementsMounted: autoUpdate,
  })

  useEffect(() => {
    if (anchor) refs.setReference(anchor)
    if (floating) refs.setFloating(floating)
  }, [anchor, floating, refs])

  const handleMouseEnter = () => setShow((prev) => (prev === 'hide' ? prev : true))
  const handleMouseLeave = () => setShow((prev) => (prev === true ? false : prev))

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick()
    } else {
      e.stopPropagation()
      setShow(isShowing ? false : 'show')
    }
  }

  const floatingElement = document.getElementById('floating')

  return (
    <>
      <ContextMenuButton
        ref={setAnchor}
        selected={isShowing}
        actionIcon={IconChevronRight}
        onClick={(e) => handleClick(e)}
        onMouseEnter={handleMouseEnter}
        icon={icon}
        symbol={symbol}
        destructive={destructive}>
        {buttonContent}
      </ContextMenuButton>

      {floatingElement &&
        isShowing &&
        createPortal(
          <div
            ref={setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 1000,
            }}
            onMouseLeave={handleMouseLeave}
            onMouseDown={(e) => e.stopPropagation()}>
            {/* Virtual element for mouse tracking */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: -(anchor?.clientWidth ?? 0) - 5,
                width: (anchor?.clientWidth ?? 0) + 5,
                height: anchor?.clientHeight ?? 0,
                cursor: 'pointer',
              }}
              onClick={(e) => {
                if (onClick) {
                  onClick()
                } else {
                  e.stopPropagation()
                  setShow((prev) => (prev ? 'hide' : true))
                }
              }}>
              <ContextMenu>{children}</ContextMenu>
            </div>
          </div>,
          floatingElement
        )}
    </>
  )
}
