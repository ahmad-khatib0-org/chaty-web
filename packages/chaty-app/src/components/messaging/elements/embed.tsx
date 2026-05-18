import Image from 'next/image'

import { ImageEmbed, MessageEmbed, TextEmbed, VideoEmbed, WebsiteEmbed } from 'chaty-client/models'
import { SizedContent } from '@/components/ui/sized-content'
import { ObjString } from '@/types/shared'
import { EmbedText } from './embed-text'

interface Props {
  tr: ObjString
  embed: MessageEmbed
}

/**
 * Render a given embed
 */
export function Embed({ embed, tr }: Props) {
  /**
   * Whether the embed is a GIF
   */
  const isGIF = () => {
    return (
      embed instanceof WebsiteEmbed &&
      (embed.special?.gif !== undefined || embed.originalUrl?.startsWith('https://tenor.com'))
    )
  }

  /**
   * Whether there is a video
   */
  const video = () => {
    return (embed instanceof VideoEmbed ? embed : isGIF() && (embed as WebsiteEmbed).video) || undefined
  }

  /**
   * Whether there is a image
   */
  const image = () => {
    return (embed instanceof ImageEmbed ? embed : isGIF() && (embed as WebsiteEmbed).image) || undefined
  }

  const imageData = image()
  const videoData = video()
  if (imageData) {
    return (
      <SizedContent width={imageData.width} height={imageData.height}>
        <Image
          src={isGIF() ? imageData.url : imageData.proxiedURL}
          loading='lazy'
          className='cursor-pointer rounded-md object-contain w-full h-full'
          onClick={() => { } /* TODO: open a model to view the image */}
          alt=''
        />
      </SizedContent>
    )
  }

  if (videoData) {
    return (
      <SizedContent width={videoData.width} height={videoData.height}>
        <video
          loop={isGIF()}
          muted={isGIF()}
          autoPlay={isGIF()}
          controls={!isGIF()}
          preload='metadata'
          src={isGIF() ? videoData.url : videoData.proxiedURL}
          className={
            isGIF()
              ? 'cursor-pointer rounded-md object-contain w-full h-full'
              : 'rounded-md object-contain w-full h-full'
          }
          onClick={() => {
            /*  TODO: open a model if isGIF() */
          }}
        />
      </SizedContent>
    )
  }

  if (embed instanceof WebsiteEmbed || embed instanceof TextEmbed) {
    return <EmbedText embed={embed} tr={tr} />
  }

  return <div>{tr.couldntRender}</div>
}
