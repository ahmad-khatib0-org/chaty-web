import { useRef, useEffect } from 'react'

interface Props {
  disabled?: boolean
}

export function Ripple({ disabled = false }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (disabled) return

    const element = ref.current
    if (!element) return

    const createRipple = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2

      const ripple = document.createElement('span')
      ripple.className = 'absolute rounded-full bg-current opacity-20 animate-ripple'
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`

      element.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove())
    }

    element.addEventListener('mousedown', createRipple)
    return () => element.removeEventListener('mousedown', createRipple)
  }, [disabled])

  return (
    <div
      ref={ref}
      className='absolute inset-0 overflow-hidden pointer-events-none'
      style={{ borderRadius: 'inherit' }}
    />
  )
}
