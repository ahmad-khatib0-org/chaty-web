import Image from 'next/image'

import { Spoiler } from '@/components/ui'
import { SizedContent } from '@/components/ui/sized-content'
import { ObjString } from '@/types/shared'
import { File, Message } from 'chaty-client/models'
import { FileInfo, TextFile } from '.'

/**
 * Render a given list of files
 */
export function Attachment({ file, message, tr }: { file: File; message?: Message; tr: ObjString }) {
  if (file.contentType === 'image') {
    const meta = file.metadata?.image
    return (
      <SizedContent width={meta?.width ?? 0} height={meta?.height ?? 0}>
        {file.isSpoiler && <Spoiler contentType='Image' clickToShow={tr.clickToShow} />}
        <Image
          src={file.createFileURL() ?? ''}
          alt=''
          fill
          className='cursor-pointer'
          sizes='100%'
          onClick={() => { } /* TODO: open a model **/}
        />
      </SizedContent>
    )
  }

  if (file.contentType === 'video') {
    const meta = file.metadata?.video
    return (
      <SizedContent width={meta?.width ?? 0} height={meta?.height ?? 0}>
        {file.isSpoiler && <Spoiler contentType='Image' clickToShow={tr.clickToShow} />}
        <video controls preload='metadata' src={file.originalUrl} />
      </SizedContent>
    )
  }

  if (file.contentType === 'audio') {
    return (
      <div className='p-4 rounded-md text-(--md-sys-color-inverse-on-surface) bg-(--md-sys-color-inverse-surface)'>
        <FileInfo file={file} />
        <SizedContent width={360} height={48}>
          <audio
            controls
            src={file.originalUrl}
            onContextMenu={() => {
              /* TODO: add it */
            }}
            className='w-full'
          />
        </SizedContent>
      </div>
    )
  }

  // File
  if (file.contentType === 'file') {
    return (
      <div className='p-4 rounded-md text-(--md-sys-color-inverse-on-surface) bg-(--md-sys-color-inverse-surface)'>
        <FileInfo file={file} />
      </div>
    )
  }

  // Text
  if (file.contentType === 'text') {
    return (
      <div className='p-4 rounded-md text-(--md-sys-color-inverse-on-surface) bg-(--md-sys-color-inverse-surface)'>
        <FileInfo file={file} />
        <SizedContent width={480} height={120}>
          <TextFile file={file} loadFile={tr.loadFile} />
        </SizedContent>
      </div>
    )
  }

  return (
    <div>
      {tr.couldntRender} {file.contentType}!
    </div>
  )
}
