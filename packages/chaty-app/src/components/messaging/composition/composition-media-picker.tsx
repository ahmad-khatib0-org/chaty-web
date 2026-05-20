import { useState, useEffect, ReactNode, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'

import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react'

interface Props {
  children: (triggerProps: {
    ref: (node: HTMLElement | null) => void
    onClickGif: () => void
    onClickEmoji: () => void
  }) => ReactNode
  onMessage: (content: string) => void
  onTextReplacement: (node: string) => void
}

export const CompositionMediaPickerContext = createContext<Pick<
  Props,
  'onMessage' | 'onTextReplacement'
> | null>(null)

export function CompositionMediaPicker(props: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [show, setShow] = useState<'gif' | 'emoji' | null>(null)

  return (
    <CompositionMediaPickerContext.Provider
      value={{ onMessage: props.onMessage, onTextReplacement: props.onTextReplacement }}>
      {props.children({
        ref: setAnchor,
        onClickGif: () => setShow((current) => (current === 'gif' ? null : 'gif')),
        onClickEmoji: () => setShow((current) => (current === 'emoji' ? null : 'emoji')),
      })}
      {show &&
        createPortal(
          <Picker
            anchor={anchor}
            show={show}
            setShow={setShow}
            onMessage={props.onMessage}
            onTextReplacement={props.onTextReplacement}
          />,
          document.getElementById('floating') || document.body
        )}
    </CompositionMediaPickerContext.Provider>
  )
}

function Picker({
  anchor,
  show,
  setShow,
  onMessage,
  onTextReplacement,
}: {
  anchor: HTMLElement | null
  show: 'gif' | 'emoji'
  setShow: (value: 'gif' | 'emoji' | null) => void
  onMessage: (content: string) => void
  onTextReplacement: (node: string) => void
}) {
  const [floating, setFloating] = useState<HTMLDivElement | null>(null)

  const { x, y, strategy, refs } = useFloating({
    open: true,
    onOpenChange: () => { },
    placement: 'top-end',
    middleware: [offset(5), flip(), shift()],
    whileElementsMounted: autoUpdate,
  })

  useEffect(() => {
    if (anchor) refs.setReference(anchor)
    if (floating) refs.setFloating(floating)
  }, [anchor, floating, refs])

  useEffect(() => {
    const onMouseDown = () => setShow(null)
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [setShow])

  return (
    <div
      ref={setFloating}
      className='w-100 h-100'
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
      }}>
      <div className='w-full h-full select-none flex flex-col gap-4 items-stretch overflow-hidden py-4 rounded-lg text-(--md-sys-color-on-surface) fill-(--md-sys-color-on-surface) shadow-md bg-(--md-sys-color-surface-container)'>
        <div className='flex justify-center'>
          <div className='flex'>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-l-md ${show === 'gif'
                  ? 'bg-(--md-sys-color-primary) text-(--md-sys-color-on-primary)'
                  : 'bg-(--md-sys-color-surface-container-high) text-(--md-sys-color-on-surface) hover:bg-(--md-sys-color-surface-container-highest)'
                }`}
              onClick={() => setShow('gif')}>
              GIFs
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-r-md ${show === 'emoji'
                  ? 'bg-(--md-sys-color-primary) text-(--md-sys-color-on-primary)'
                  : 'bg-(--md-sys-color-surface-container-high) text-(--md-sys-color-on-surface) hover:bg-(--md-sys-color-surface-container-highest)'
                }`}
              onClick={() => setShow('emoji')}>
              Emoji
            </button>
          </div>
        </div>

        {/*  TODO: add the pickers*/}
        <div className='flex-1 min-h-0 overflow-auto px-2'>
          {show === 'gif' ? (
            <GifPicker />
          ) : show === 'emoji' ? (
            <EmojiPicker />
          ) : (
            <span>Not available yet.</span>
          )}
        </div>
      </div>
    </div>
  )
}

export const compositionContent = 'flex-1 min-h-0'

// Export context hook
export function useCompositionMediaPicker() {
  const context = useContext(CompositionMediaPickerContext)
  if (!context) {
    throw new Error('useCompositionMediaPicker must be used within CompositionMediaPicker')
  }
  return context
}
