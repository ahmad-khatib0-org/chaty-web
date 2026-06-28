import { ReactNode, useEffect, useRef } from 'react'

interface Props<T> {
  /**
   * Items to display with degrees
   */
  items: [T, number][]

  /**
   * Render each child
   * @param item Item
   * @returns Element
   */
  children: (item: T) => ReactNode

  /**
   * Animate the stack to closure
   */
  hideStack?: boolean

  /**
   * Additional elements to display on the stack
   */
  overlay?: ReactNode
}

/**
 * Default transform used for children
 */
const DEFAULT_TRANSFORM = 'translate(-50%, -50%) scale(0.001)'

function StackElement<T>({ item, children }: { item: [T, number]; children: (item: T) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (ref.current) {
        ref.current.style.transform = `translate(-50%, -50%) rotate(${item[1]}deg) translate(0, -30px)`
      }
    })

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div
      ref={ref}
      className='absolute top-1/2 left-1/2 opacity-90 transition-all duration-150'
      style={{ transform: DEFAULT_TRANSFORM }}>
      {children(item[0])}
    </div>
  )
}

export function PreviewStack<T>({ children, items, overlay, hideStack }: Props<T>) {
  return (
    <div className='relative mx-auto bg-gray-500'>
      {items.map((item, index) => (
        <StackElement key={index} item={item} children={children} />
      ))}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>{overlay}</div>

      {hideStack && (
        <div className='absolute inset-0'>
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 transition-all duration-150 *:transform-[translate(-50%,-50%)_scale(0.001)]!' />
        </div>
      )}
    </div>
  )
}
