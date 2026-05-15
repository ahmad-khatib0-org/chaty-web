import { humanFileSize } from '@/lib/client'
import {
  IconDownload,
  IconFile,
  IconFileText,
  IconHeadphones,
  IconPhoto,
  IconVideo,
} from '@tabler/icons-react'
import { File, ImageEmbed, MessageEmbed, VideoEmbed } from 'chaty-client/models'

interface Props {
  /**
   * File information
   */
  file?: File

  /**
   * Embed information
   */
  embed?: MessageEmbed
}

export function FileInfo({ file, embed }: Props) {
  // Determine icon
  let Icon = IconFile
  if (file?.contentType === 'image' || (embed && embed instanceof ImageEmbed)) {
    Icon = IconPhoto
  } else if (file?.contentType === 'video' || (embed && embed instanceof VideoEmbed)) {
    Icon = IconVideo
  } else if (file?.contentType === 'audio') {
    Icon = IconHeadphones
  } else if (file?.contentType === 'text') {
    Icon = IconFileText
  }

  return (
    <div className='flex items-center gap-3'>
      <Icon size={24} className='shrink-0' />

      <div className='flex-1 min-w-0 '>
        <span className='block truncate'>{file?.filename}</span>
        {file?.size && (
          <span className='text-xs text[var(--md-sys-color-outline)]'>{humanFileSize(file.size)}</span>
        )}
        {file && (
          <a
            rel='noopener noreferrer'
            target='_blank'
            href={file.originalUrl}
            download={file.filename}
            className='p-2 rounded-full hover:bg-(--md-sys-color-surface-container-hover) transition-colors'>
            <IconDownload size={20} />
          </a>
        )}
      </div>
    </div>
  )
}
