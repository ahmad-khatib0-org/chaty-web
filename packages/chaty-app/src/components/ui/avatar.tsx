import { ReactNode } from 'react'

import { Ripple, Initials } from '.'

export type Props = {
  /**
   * Avatar size
   */
  size?: number

  /**
   * Avatar shape
   */
  shape?: 'circle' | 'rounded-square'

  /**
   * Image source
   */
  src?: string

  /**
   * Fallback if no source
   */
  fallback?: string | ReactNode

  /**
   * If this avatar falls back, use primary contrasting colours
   */
  primaryContrast?: boolean

  /**
   * Punch a hole through the avatar
   */
  holepunch?: 'bottom-right' | 'top-right' | 'right' | 'overlap' | 'overlap-subtle' | 'none' | false

  /**
   * Specify overlay component
   */
  overlay?: ReactNode

  /**
   * Whether this icon is interactive
   */
  interactive?: boolean

  /**
   * Click handler
   */
  onClick?: (e: React.MouseEvent) => void

  /**
   * HTML slot attribute
   */
  slot?: string
}

const holepunchMask: Record<string, string> = {
  'bottom-right': 'url(#holepunch-bottom-right)',
  'top-right': 'url(#holepunch-top-right)',
  right: 'url(#holepunch-right)',
  overlap: 'url(#holepunch-overlap)',
  'overlap-subtle': 'url(#holepunch-overlap-subtle)',
}

export function Avatar({
  size = 32,
  shape = 'circle',
  src,
  fallback,
  primaryContrast = false,
  holepunch,
  overlay,
  interactive = false,
  onClick,
  slot,
}: Props) {
  const maskStyle =
    holepunch && holepunch !== 'none' && typeof holepunch === 'boolean' && holepunch !== false
      ? { WebkitMask: holepunchMask[holepunch], mask: holepunchMask[holepunch] }
      : {}

  return (
    <div
      slot={slot}
      className={`shrink-0 select-none ${interactive ? 'cursor-pointer' : 'cursor-inherit'}`}
      style={{ width: size, height: size }}
      onClick={onClick}>
      <svg width='100%' height='100%' viewBox='0 0 32 32'>
        <foreignObject
          x='0'
          y='0'
          width='32'
          height='32'
          style={{
            overflow: 'hidden',
            transition: 'var(--transitions-fast) filter',
            ...maskStyle,
          }}>
          <div
            className={`overflow-hidden w-full h-full ${shape === 'circle' ? 'rounded-full' : 'rounded-md'}`}>
            {interactive && <Ripple />}
            {src ? (
              <img src={src} className='w-full h-full object-cover' draggable={false} />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center font-semibold text-xs 
                ${primaryContrast
                    ? 'text-(--md-sys-color-on-primary) bg-(--md-sys-color-primary)'
                    : 'text-(--md-sys-color-on-surface) bg-(--md-sys-color-surface-container-low)'
                  }`}>
                {typeof fallback === 'string' ? <Initials input={fallback} maxLength={2} /> : fallback}
              </div>
            )}
          </div>
        </foreignObject>
        {overlay}
      </svg>
    </div>
  )
}
