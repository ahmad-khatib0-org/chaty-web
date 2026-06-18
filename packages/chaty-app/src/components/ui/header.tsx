interface Props {
  placement: 'primary' | 'secondary'
  topBorder?: boolean
  bottomBorder?: boolean
  image?: boolean
  transparent?: boolean
  children?: React.ReactNode
  className?: string
}

/**
 * Header component
 */
export const Header: React.FC<Props> = ({
  placement = 'primary',
  image = false,
  transparent = false,
  children,
  className = '',
}) => {
  const baseClasses =
    'gap-2.5 flex flex-shrink-0 px-4 items-center font-semibold select-none overflow-hidden h-12 rounded-lg text-[var(--md-sys-color-on-surface)] fill-[var(--md-sys-color-on-surface)] bg-cover bg-center [&_svg]:flex-shrink-0'

  const placementClasses = {
    primary: 'm-4 mr-4 mb-4 mt-4',
    secondary: 'm-4 bg-[var(--md-sys-color-surface-variant)]',
  }

  const imageClasses = image
    ? 'text-white fill-white p-0 items-end justify-stretch [text-shadow:0px_0px_1px_var(--md-sys-color-shadow)] h-[120px] [&>div]:flex-grow [&>div]:p-[6px_14px] [&>div]:bg-gradient-to-t [&>div]:from-black [&>div]:to-transparent'
    : ''

  const transparentClasses = transparent ? 'w-[calc(100%-var(--gap-md))] z-10' : ''

  return (
    <div
      className={`${baseClasses} ${placementClasses[placement]} ${imageClasses} ${transparentClasses} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Position an element below a floating header
 */
export const BelowFloatingHeader: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className='relative z-10 [&>div>div]:w-full [&>div>div]:absolute [&>div>div]:top-(--gap-md)'>
      {children}
    </div>
  )
}
