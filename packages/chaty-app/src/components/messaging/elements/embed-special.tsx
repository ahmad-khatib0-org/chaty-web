import { WebsiteEmbed } from 'chaty-client/models'
import { SizedContent } from '@/components/ui'

interface SpecialEmbedProps {
  embed: WebsiteEmbed
}

/**
 * Special Embed
 */
export function SpecialEmbed({ embed }: SpecialEmbedProps) {
  /**
   * Determine the media size
   */
  function getSize() {
    const special = embed.special!
    let width = 0
    let height = 0

    if (special.youtube) {
      width = embed.video?.width ?? 1280
      height = embed.video?.height ?? 720
    } else if (special.twitch) {
      width = 1280
      height = 720
    } else if (special.lightspeed) {
      width = 1280
      height = 720
    } else if (special.spotify) {
      width = 420
      height = 355
    } else if (special.soundcloud) {
      width = 480
      height = 460
    } else if (special.bandcamp) {
      width = embed.video?.width ?? 1280
      height = embed.video?.height ?? 720
    }

    return { width, height }
  }

  const { width, height } = getSize()

  return (
    <SizedContent width={width} height={height}>
      <iframe
        loading='lazy'
        scrolling='no'
        allowFullScreen
        allowTransparency
        frameBorder={0}
        src={embed.embedURL}
        className='w-full h-full rounded-md'
        title='Special embed content'
      />
    </SizedContent>
  )
}
