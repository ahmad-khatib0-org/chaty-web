import { useRef } from 'react'

import { ALLOWED_IMAGE_TYPES } from '@/state'
import { IconFile, IconPlus, IconX } from '@tabler/icons-react'

interface Props {
  /**
   * Files to display in carousel
   */
  files: string[]

  /**
   * Get file by ID
   * @param fileId ID
   */
  getFile(fileId: string): {
    file: File
    dataUri?: string
  }

  /**
   * Invoke file picker to add file
   */
  addFile(): void

  /**
   * Remove file by ID
   * @param fileId ID
   */
  removeFile(fileId: string): void
}

/**
 * Determine file size
 * @param size Bytes
 * @returns Human-readable size
 */
export function determineFileSize(size: number) {
  if (size > 1e6) {
    return `${(size / 1e6).toFixed(2)} MB`
  } else if (size > 1e3) {
    return `${(size / 1e3).toFixed(2)} KB`
  }

  return `${size} B`
}

export function FileCarousel({ addFile, removeFile, getFile, files }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null)

  if (!files.length) return null

  const maxFiles = process.env.NEXT_PUBLIC_MAX_ATTACHMENTS
    ? parseInt(process.env.NEXT_PUBLIC_MAX_ATTACHMENTS)
    : 5

  return (
    <div className='flex flex-col select-none gap-4 p-4 my-4 rounded-xl bg-(--md-sys-color-primary-container) text-(--md-sys-color-on-primary-container) [--preview-size:100px]'>
      <div
        ref={carouselRef}
        className='flex shrink-0 flex-row overflow-x-auto gap-4 [&::-webkit-scrollbar]:hidden'>
        {files.map((id, idx) => {
          const file = getFile(id)
          const isImage = ALLOWED_IMAGE_TYPES.includes(file.file.type)
          const isIgnored = idx >= maxFiles

          return (
            <>
              {idx === maxFiles && (
                <div className='h-32.5 shrink-0 w-(--gap-sm) rounded-(--borderRadius-md) bg-(--md-sys-color-outline)' />
              )}

              <div className={`flex items-center flex-col ${isIgnored ? 'opacity-40' : 'opacity-100'}`}>
                {/* Preview Box */}
                <div
                  className="grid justify-items-center [grid-template:'main'_var(--preview-size)/minmax(var(--preview-size),1fr)] cursor-pointer overflow-hidden rounded-(--gap-md) fill-white bg-(--md-sys-color-surface-variant)"
                  onClick={() => removeFile(id)}>
                  <div className='col-start-1 row-start-1 col-end-2 row-end-2'>
                    {isImage && (
                      <img
                        src={file.dataUri}
                        alt={file.file.name}
                        loading='eager'
                        className='w-full object-cover mb-4 h-(--preview-size)'
                      />
                    )}
                    {!isImage && (
                      <div className='grid shrink-0 place-items-center w-(--preview-size) h-(--preview-size) cursor-pointer rounded-(--gap-md) fill-(--md-sys-color-on-surface-variant) bg-(--md-sys-color-surface-variant)'>
                        <IconFile size={36} />
                      </div>
                    )}
                  </div>

                  {/* Overlay */}
                  <div className='col-start-1 row-start-1 col-end-2 row-end-2 z-10 grid items-center justify-center w-full h-full opacity-0 hover:opacity-100 text-white bg-black/80 transition-opacity duration-150'>
                    <IconX size={36} />
                  </div>
                </div>

                <span className='max-w-(--preview-size) text-center text-sm font-medium truncate'>
                  {file.file.name}
                </span>

                <span className='text-xs font-medium'>{determineFileSize(file.file.size)}</span>
              </div>
            </>
          )
        })}

        <div
          className='relative grid shrink-0 place-items-center w-(--preview-size) h-(--preview-size) cursor-pointer rounded-(--gap-md) fill-(--md-sys-color-on-surface-variant) bg-(--md-sys-color-surface-variant)'
          onClick={addFile}>
          <IconPlus size={48} />
        </div>
      </div>
    </div>
  )
}
