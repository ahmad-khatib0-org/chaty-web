import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconFile, IconFileText, IconPhoto, IconVideo } from '@tabler/icons-react'

import { PreviewStack } from '@/components/ui'

interface Props {
  /**
   * Callback for dropped files
   * @param files List of files
   */
  onFiles: (files: File[]) => void

  /**
   * Whether to allow dropping files while in a modal
   */
  allowInModal?: boolean
}

/**
 * Collect files that are dropped anywhere in the page
 */
export function FileDropAnywhereCollector({ onFiles, allowInModal }: Props) {
  const [showIndicator, setShowIndicator] = useState(false)
  const [hideIndicator, setHideIndicator] = useState(false)
  const [items, setItems] = useState<DataTransferItem[]>([])

  /**
   * Since we get events from the whole DOM tree, we want to
   * check if we get a dragOver event immediately after dragLeave,
   * if so: cancel the update to prevent updating preview.
   */
  const deferredHideRef = useRef<number | undefined>(undefined)

  /**
   * Handle item drag event
   * @param event Drag event
   */
  function onDragOver(event: DragEvent) {
    // TODO: check if a model is open

    event.preventDefault()
    clearTimeout(deferredHideRef.current)

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'

      if (!showIndicator) {
        setShowIndicator(true)
        setHideIndicator(false)
        setItems([...event.dataTransfer.items])
      }
    }
  }

  function onDragLeave() {
    deferredHideRef.current = setTimeout(() => {
      setHideIndicator(true)

      setTimeout(() => {
        setShowIndicator(false)
      }, 300)
    }) as unknown as number
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()

    const files = event.dataTransfer?.files
    if (files) {
      onFiles([...files])
    }

    setShowIndicator(false)
  }

  useEffect(() => {
    document.addEventListener('dragover', onDragOver)
    document.addEventListener('dragleave', onDragLeave)
    document.addEventListener('drop', onDrop)

    return () => {
      document.removeEventListener('dragover', onDragOver)
      document.removeEventListener('dragleave', onDragLeave)
      document.removeEventListener('drop', onDrop)
    }
  }, [])

  /**
   * Generate list of preview items
   */
  const previewItems = items.map(
    (item, index) =>
      [item, index * (80 / items.length) - (items.length - 1) * (40 / items.length)] as [
        DataTransferItem,
        number,
      ]
  )

  if (!showIndicator) return null

  const floatingElement = document.getElementById('floating')

  return createPortal(
    <>
      {!hideIndicator && <div className='fixed inset-0 bg-black/80 pointer-events-none' />}
      <div className='fixed inset-0 grid place-items-center pointer-events-none text-white'>
        <PreviewStack
          items={previewItems}
          hideStack={hideIndicator}
          overlay={
            <div className='mt-12 whitespace-nowrap text-center'>
              <div
                className='opacity-0 animate-[fadeIn_0.2s_ease_forwards]'
                style={{
                  animationName: 'fadeIn',
                  animationDuration: '0.2s',
                  animationTimingFunction: 'ease',
                }}>
                {items.length === 1 ? 'Drop a file' : `Drop ${items.length} files`}
              </div>
            </div>
          }>
          {(item: DataTransferItem) => {
            if (item.type.startsWith('text/')) {
              return <IconFileText size={64} />
            }
            if (item.type.startsWith('image/')) {
              return <IconPhoto size={64} />
            }
            if (item.type.startsWith('video/')) {
              return <IconVideo size={64} />
            }
            return <IconFile size={64} />
          }}
        </PreviewStack>
      </div>
    </>,
    floatingElement || document.body
  )
}
